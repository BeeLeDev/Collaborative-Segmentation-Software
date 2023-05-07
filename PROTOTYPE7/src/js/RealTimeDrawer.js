

class RealTimeDrawer {
    constructor(viewer) {
        this.nv = viewer.nv;
        this.viewer = viewer;
        this.prevColor = 1;
        this.setUpInteraction();
        this.currentDrawData = [];
        this.isFilled = false;
        this.last_drawing = [];
        this.position = null;
        this.isNewUser = true;


    }
}
RealTimeDrawer.prototype.setUpInteraction = function () {

    this.nv.onLocationChange = function (e) {
        this.position = e['vox'];
    }.bind(this);



    const element = document.getElementById('viewer');

    element.onmousemove = this.onMouseMove.bind(this);
    element.onmouseup = this.onMouseUp.bind(this);
    element.onkeydown = this.onKeyDown.bind(this);
    this.connect();

    let nvobj = this.nv;
    nvobj.setPenValue(1, this.isFilled); // initializing for color red
    $(".colorPickSelector").colorPick({
        'initialColor': "#FF0000", // initial color in pallete
        'onColorSelected': function () {
            this.element.css({ 'backgroundColor': this.color, 'color': this.color });
            nvobj.setPenValue(colorlist[this.color], this.isFilled); // settign color value
        }
    });

}

RealTimeDrawer.prototype.onMouseMove = function (e) {
    if (this.isFilled) {
        this.draw()
    } else if (e.buttons && this.nv.opts.drawingEnabled && this.position && this.position.length > 0) {
        let pt = [this.position[0], this.position[1], this.position[2]]
        this.last_drawing.push(pt)
    }

    if (this.nv.opts.penValue > 0) {
        this.prevColor = this.nv.opts.penValue;
    }

};

RealTimeDrawer.prototype.onMouseUp = function (e) {
    this.nv.refreshDrawing();
    this.position = [];
    if (this.nv.opts.penValue >= 0 && this.nv.opts.drawingEnabled && this.last_drawing.length > 0) {
        let shareObj = { 'isFilled': this.isFilled, 'drawing': this.last_drawing, 'label': this.nv.opts.penValue };
        this.currentDrawData.push(shareObj);
        // send via pusher
        LINK.trigger('client-receive', shareObj);
    }
    this.last_drawing = [];


};

RealTimeDrawer.prototype.onKeyDown = function (e) {
    if (e.keyCode == 68) {
        // enable n disable draw onclick of letter "d"
        this.enable_disable_Drawing();
    }
    else if (e.code == 'Space') {
        // space - change view
        this.viewer.changeView()
        LINK.trigger('client-set-slicetype', { 'view_number': this.viewer.view });
    }
    else if (e.keyCode == 90 && e.ctrlKey) {
        // capturing ctrl + z for undo
        this.nv.drawUndo();
        this.currentDrawData.pop()
        LINK.trigger('client-undo', {});

    }
    else if (e.keyCode == 89 && e.ctrlKey) {
        //save drawing as image on Ctrl + Y
        this.saveDrawing()
    }

    else if (e.keyCode == 66 && e.ctrlKey) {
        //save drawing as screenshot on Ctrl + B
        this.saveScreenshot()
    }
    else if (e.keyCode == 69) {
        //onclick of E - erase is enabled
        this.nv.setDrawingEnabled(true);
        this.nv.setPenValue(0);
    }

    else if (e.keyCode == 49) {
        //onclick of 1
        this.nv.opts.dragMode = this.nv.dragModes.pan; // this for zoom functionality
    }

    else if (e.keyCode == 50) {
        //onclick of 2
        this.nv.opts.dragMode = this.nv.dragModes.measurement; // this for measurement;
    }

    else if (e.keyCode == 51) {
        //onclick of 3 
        this.nv.opts.dragMode = this.nv.dragModes.none; // this for none
    }

    this.nv.updateGLVolume()
}


RealTimeDrawer.prototype.enable_disable_Drawing = function () {
    this.toggle = document.getElementById("toggleDrawing");
    if (this.nv.opts.penValue == 0) {
        this.nv.setPenValue(this.prevColor);
        return;
    }
    this.nv.setDrawingEnabled(!this.nv.opts.drawingEnabled);


    if (this.nv.opts.drawingEnabled) {
        this.toggle.innerHTML = "Enabled";
    }
    else {
        this.toggle.innerHTML = "Disabled";
    }
}

RealTimeDrawer.prototype.saveDrawing = function () {
    //this.nv.saveImage("draw.nii", true);
    this.nv.saveDocument("niivue.drawing.nvd");
    return;
};

RealTimeDrawer.prototype.saveScreenshot = function () {
    this.nv.saveScene("niivue.png")
};

RealTimeDrawer.prototype.draw = function () {
    //console.log(nv.drawPenFillPts)
    if (this.nv.drawPenFillPts.length > 0) {
        this.last_drawing = this.nv.drawPenFillPts;
    }

};

RealTimeDrawer.prototype.drawAnnotation = function (ptA, ptB, label, nv) {
    if (!nv.opts.drawingEnabled) {
        nv.setDrawingEnabled(true);
    }
    //nv.setDrawingEnabled(false);

    nv.drawPenLine(ptA, ptB, label);
    console.log(nv.drawPenFillPts)
    nv.refreshDrawing(true);
}

RealTimeDrawer.prototype.drawOnPusherTrigger = function (data, currentThis) {
    let startPt = [data['drawing'][0][0], data['drawing'][0][1], data['drawing'][0][2]]
    let constStartpt = startPt;
    let value = data['label'];
    for (var i = 1; i < data['drawing'].length; i++) {

        let x = data['drawing'][i][0];
        let y = data['drawing'][i][1];
        let z = data['drawing'][i][2];
        var endpoint = [x, y, z]
        currentThis.drawAnnotation(startPt, endpoint, value, currentThis.nv)
        startPt = endpoint;
        currentThis.nv.refreshDrawing(true);
    }
    //connecting the first and last point
    if (data['isFilled']) { currentThis.drawFilled(constStartpt, endpoint, value, currentThis.nv); }

    currentThis.nv.drawAddUndoBitmap();
    currentThis.currentDrawData.push(data)

    if (this.toggle = document.getElementById("toggleDrawing").innerHTML == "Disabled") {
        currentThis.nv.setDrawingEnabled(false);
    }

}

RealTimeDrawer.prototype.setSliceType = function (data, currentThis) {
    currentThis.nv.setSliceType(data);
    currentThis.viewer.view = data
}

RealTimeDrawer.prototype.SyncOnJoin = function (data, currentThis) {
    if (currentThis.isNewUser) {
        let newDataLength = data.currentDrawData?.length;
        currentThis.setSliceType(data.view, currentThis)
        if (newDataLength > currentThis.currentDrawData?.length) {
            data.currentDrawData.forEach(ele => {
                currentThis.drawOnPusherTrigger(ele, currentThis);
            });
        }

        if (data?.thisMM) {
            currentThis.nv.scene.crosshairPos = currentThis.nv.mm2frac(data?.thisMM);

        }
        currentThis.nv.drawScene();
        currentThis.nv.createOnLocationChange();


        currentThis.isNewUser = false;
    }
}


RealTimeDrawer.prototype.connect = function () {
    var channelname = 'cs410';

    console.log('Linking via channel ' + channelname + '...');

    // Pusher.logToConsole = true; // for debugging

    const pusher = new Pusher('bb9db0457c7108272899', {
        cluster: 'us2',
        userAuthentication: { endpoint: "https://x.babymri.org/auth.php" },
        authEndpoint: "https://x.babymri.org/auth.php"
    });

    var channel = 'private-' + channelname;
    LINK = pusher.subscribe(channel);
    let drawtoSubscibers = this.drawOnPusherTrigger;
    let setSliceType = this.setSliceType;
    let currentThis = this;
    let SyncOnJoin = this.SyncOnJoin;
    // syncing annotaions  
    LINK.bind('client-receive', (data) => {
        if (data && data['drawing'].length > 0) {
            drawtoSubscibers(data, currentThis);
        }
    });
    // syncing view changes  functionality
    LINK.bind('client-set-slicetype', function (data) {
        setSliceType(data['view_number'], currentThis);
    });
    // syncing undo functionality
    LINK.bind('client-undo', function (data) {
        currentThis.nv.drawUndo();
        currentThis.currentDrawData.pop()
    });


    // client sync on join
    LINK.bind('client-sync-needed', (item) => {
        if (item.isNeeded) {
            LINK.trigger('client-sync-onjoin', {
                'currentDrawData': currentThis.currentDrawData,
                'view': currentThis.viewer.view,
                'thisMM': currentThis.nv.frac2mm(currentThis.nv.scene.crosshairPos),
            })
        }
    });
    LINK.bind('client-sync-onjoin', (item) => {
        try {
            jSuites.loading.show();
            SyncOnJoin(item, currentThis);
        } finally {
            jSuites.loading.hide();
        }

    });

    LINK.bind('pusher:subscription_succeeded', () => {
        try {
            currentThis.isNewUser = true;
            jSuites.loading.show();
            LINK.trigger('client-sync-needed', {
                'isNeeded': true
            });
        } catch (err) {
            jSuites.loading.hide();
        }

        setTimeout(function () {
            // Hide
            jSuites.loading.hide();
        }, 2000);

    });


};



