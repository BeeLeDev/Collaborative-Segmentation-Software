

class Drawer {
    constructor(viewer) {
        this.nv = viewer.nv;
        this.setUpInteraction();

    }
}
Drawer.prototype.setUpInteraction = function () {

    /* this.nv.onLocationChange = function (e) {

        position = e['vox'];

    }.bind(this); */

    const element = document.getElementById('viewer');

    element.onmousemove = this.onMouseMove.bind(this);
    element.onmouseup = this.onMouseUp.bind(this);
    element.onkeydown = this.onKeyDown.bind(this);
    this.connect();

}

Drawer.prototype.onMouseMove = function (e) {
    this.draw()
};

Drawer.prototype.onMouseUp = function (e) {
    this.nv.refreshDrawing();

    // send via pusher
    LINK.trigger('client-receive', { 'drawing': last_drawing, 'label': this.nv.opts.penValue });

};

Drawer.prototype.onKeyDown = function (e) {

    if (e.keyCode == 49) {
        // Red - click 1
        this.nv.setDrawingEnabled(!this.nv.opts.drawingEnabled);
        this.nv.setPenValue(1, true);
    }
    else if (e.keyCode == 50) {
        // Green - click 2
        this.nv.setDrawingEnabled(!this.nv.opts.drawingEnabled);
        this.nv.setPenValue(2, true);
    }
    this.nv.updateGLVolume()
}


Drawer.prototype.draw = function () {
    //console.log(nv.drawPenFillPts)
    if (this.nv.drawPenFillPts.length > 0) {
        last_drawing = this.nv.drawPenFillPts;
    }

};

Drawer.prototype.drawFilled = function (ptA, ptB, label, newNvObj) {
    if (!newNvObj.opts.drawingEnabled) {
        newNvObj.setDrawingEnabled(true);
    }
    //newNvObj.setDrawingEnabled(false);
    newNvObj.drawPenLine(ptA, ptB, label)
    console.log(newNvObj.drawPenFillPts)
    newNvObj.refreshDrawing(true);
}

Drawer.prototype.connect = function () {

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
    let drawtoSubscibers = this.drawFilled;
    let newNvObj = this.nv
    LINK.bind('client-receive', function (data) {

        let startPt = [data['drawing'][0][0], data['drawing'][0][1], data['drawing'][0][2]]
        let constStartpt = startPt;
        let value = data['label'];
        for (var i = 1; i < data['drawing'].length; i++) {

            let x = data['drawing'][i][0];
            let y = data['drawing'][i][1];
            let z = data['drawing'][i][2];
            var endpoint = [x, y, z]
            drawtoSubscibers(startPt, endpoint, value, newNvObj)
            //this.drawFilled(startPt, endpoint, value);
            startPt = endpoint;
            newNvObj.refreshDrawing(true);


        }
        //coonectomg the first and last point 
        drawtoSubscibers(constStartpt, endpoint, value, newNvObj);
        newNvObj.setDrawingEnabled(false);

    });

};



