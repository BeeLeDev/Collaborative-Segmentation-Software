

class RealTimeDrawer {
    constructor(viewer) {
        this.nv = viewer.nv;
        this.viewer = viewer
        this.setUpInteraction();
        this.currentDrawData = [];
        this.isFilled = false;
        this.last_drawing = [];
        this.position = null;


    }
}
RealTimeDrawer.prototype.setUpInteraction = function () {

    this.nv.onLocationChange = function (e) {
        this.position = e['vox'];
    }.bind(this);

    this.nv.opts.dragMode = this.nv.dragModes.pan;

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
    } else if (e.buttons && this.nv.opts.drawingEnabled && this.position) {
        let pt = [this.position[0], this.position[1], this.position[2]]
        this.last_drawing.push(pt)
    }

};

RealTimeDrawer.prototype.onMouseUp = function (e) {
    this.nv.refreshDrawing();
    this.position = [];
    if (this.nv.opts.penValue > 0 && this.nv.opts.drawingEnabled && this.last_drawing.length > 0) {
        let shareObj = { 'isFilled': this.isFilled, 'drawing': this.last_drawing, 'label': this.nv.opts.penValue };
        this.currentDrawData.push(shareObj);
        // send via pusher
        LINK.trigger('client-receive', shareObj);
    }
    this.last_drawing = [];


};

RealTimeDrawer.prototype.onKeyDown = function (e) {
    if (e.keyCode == 68) {
        // enable draw onclick of letter "d"
        this.nv.setDrawingEnabled(true);
    }
    else if (e.keyCode == 27) {
        //diable drawing on escape
        this.nv.setDrawingEnabled(false);
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

    this.nv.updateGLVolume()
}


RealTimeDrawer.prototype.saveDrawing = function () {
    this.nv.saveImage("draw.nii", true);
    return;
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
    currentThis.nv.setDrawingEnabled(false);
}

RealTimeDrawer.prototype.setSliceType = function (data, currentThis) {
    currentThis.nv.setSliceType(data);
}

RealTimeDrawer.prototype.SyncOnJoin = function (data, currentThis) {
    if (data.currentDrawData.length > 0 && currentThis.currentDrawData.length == 0) {
        data.currentDrawData.forEach(ele => {
            currentThis.drawOnPusherTrigger(ele, currentThis);
        });
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
                'currentDrawData': currentThis.currentDrawData
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


