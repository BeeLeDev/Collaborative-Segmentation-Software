import { Niivue, NVImage, NVMesh } from '@niivue/niivue';
import { useRef, useEffect } from 'react';
import Viewer from './Viewer';
import { v4 } from 'uuid';

import Pusher from 'pusher-js';
const _location = (window.location != window.parent.location) ? document.referrer
    : document.location;
// here we make sure that location is a string
const channelname = 'mydrop-' + _location.href.split('?')[1];
function Drawer({ url }) {
    let prevPos = { offsetX: 0, offsetY: 0 };
    let line = [];
    let userStrokeStyle = '#EE92C2';
    let guestStrokeStyle = '#F0C987';
    let userId = v4();
    let pusher = new Pusher('bb9db0457c7108272899', {
        cluster: 'us2',
        userAuthentication: { endpoint: "http://x.babymri.org/auth.php" },
        authEndpoint: "http://x.babymri.org/auth.php"
    });
    let channel = pusher.subscribe('private-' + channelname);

    const handleLocationChange = (data) => {
        document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string;
    }
    const nv1 = new Niivue({
        logging: true,
        dragAndDropEnabled: true,
        backColor: [0, 0, 0, 1],
        show3Dcrosshair: true,
        onLocationChange: handleLocationChange
    })
    const volumeList1 = [{ url: url }]
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
    const isFilled = true;

    const onMouseDown = (e) => {
        console.log("mousedown", e)
        prevPos = { offsetX: e.offsetX, offsetY: e.offsetY }

    }
    const onMouseUp = (e) => {
        console.log("mouse up", e)
        console.log(nv1)
        sendPaintData();

    }
    const onMouseMove = (e) => {
        const { offsetX, offsetY } = e;
        const offSetData = { offsetX, offsetY };
        // Set the start and stop position of the paint event.
        const positionData = {
            start: { ...prevPos },
            stop: { ...offSetData },
        };
        // Add the position to the line array
        line = line.concat(positionData);
        console.log("line", line)
        draw(prevPos, offSetData,userStrokeStyle);
        //xconsole.log("mouse move", e)
    }

    function draw(prevPos, currPos) {
        const { offsetX, offsetY } = currPos;
        const { offsetX: x, offsetY: y } = prevPos;
        console.log("draw",nv1)

        /*   ctx.beginPath();
          ctx.strokeStyle = strokeStyle;
          // Move the the prevPosition of the mouse
          ctx.moveTo(x, y);
          // Draw a line to the current position of the mouse
          ctx.lineTo(offsetX, offsetY);
          // Visualize the line using the strokeStyle
          ctx.stroke(); */
        prevPos = { offsetX, offsetY };
    }
    async function sendPaintData() {
        const body = {
            line: line,
            userId: userId,
        };
        channel.trigger('client-painting', body)
    }

    useEffect(() => {
        nv1.opts.isColorbar = false
        nv1.setRadiologicalConvention(false)
        //nv1.attachTo('gl1')
        nv1.setClipPlane([0.3, 270, 0])
        nv1.setRenderAzimuthElevation(120, 10)
        nv1.setSliceType(nv1.sliceTypeMultiplanar)
        nv1.setSliceMM(true)
        nv1.opts.multiplanarForceRender = false
        nv1.graph.autoSizeMultiplanar = true
        nv1.graph.opacity = 1.0
        nv1.drawOpacity = 0.5;

        // nv1.loadVolumes(volumeList1)
        nv1.opts.isColorbar = false
        //nv1.loadDrawingFromUrl("../demos/images/lesion.nii.gz")
        nv1.canvas.onmousedown = onMouseDown;
        nv1.canvas.onmousemove = onMouseMove;
        nv1.canvas.onmouseup = onMouseUp;
        channel.bind('client-painting', (data) => {
            const { userId, line } = data;
            if (userId !== userId) {
                line.forEach((position) => {
                    draw(position.start, position.stop, guestStrokeStyle);
                });
            }
        });
        return (() => {
            pusher.unsubscribe('client-painting')
        })
    }, [volumeList1])

   

    return (
        <body>
            <header>
                {/* <div className="dropdown">
                    <button className="dropbtn">File
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a className="viewBtn" id="SaveDraw" onClick={(e) => onButtonClick(e)}>Save Drawing</a>
                        <a className="viewBtn" id="SaveBitmap" onClick={(e) => onButtonClick(e)}>Screen Shot</a>
                        <a className="viewBtn" id="ShowHeader" onClick={(e) => onButtonClick(e)}>Show Header</a>
                        <a className="linker" href="https://github.com/niivue/niivue">About</a>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn">Edit
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a className="viewBtn" id="Undo" onClick={(e) => onButtonClick(e)}>Undo Draw</a>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn" data-toggle="dropdown">View
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a href="#" className="viewBtn" id="|Axial" onClick={(e) => onButtonClick(e)}>Axial</a>
                        <a className="viewBtn" id="|Sagittal" onClick={(e) => onButtonClick(e)}>Sagittal</a>
                        <a className="viewBtn" id="|Coronal" onClick={(e) => onButtonClick(e)}>Coronal</a>
                        <a className="viewBtn" id="|Render" onClick={(e) => onButtonClick(e)}>Render</a>
                        <a className="viewBtn dropdown-item-checked" id="|MultiPlanar" onClick={(e) => onButtonClick(e)}>A+C+S</a>
                        <a className="viewBtn" id="|MultiPlanarRender" onClick={(e) => onButtonClick(e)}>A+C+S+R</a>
                        <a className="viewBtn divider dropdown-item-checked" id="Colorbar" onClick={(e) => onButtonClick(e)}>Colorbar</a>
                        <a className="viewBtn" id="Radiological" onClick={(e) => onButtonClick(e)}>Radiological</a>
                        <a className="viewBtn dropdown-item-checked" id="Crosshair" onClick={(e) => onButtonClick(e)}>Render Crosshair</a>
                        <a className="viewBtn" id="ClipPlane" onClick={(e) => onButtonClick(e)}>Render Clip Plane</a>
                        <a className="viewBtn dropdown-item-checked" id="WorldSpace" onClick={(e) => onButtonClick(e)}>World Space</a>
                        <a className="viewBtn dropdown-item-checked" id="Interpolate" onClick={(e) => onButtonClick(e)}>Smooth Interpolation</a>
                        <a className="viewBtn" id="RemoveHaze" onClick={(e) => onButtonClick(e)}>Remove Haze</a>
                        <a className="viewBtn divider" id="Left" onClick={(e) => onButtonClick(e)}>Left</a>
                        <a className="viewBtn" id="Right" onClick={(e) => onButtonClick(e)}>Right</a>
                        <a className="viewBtn" id="Anterior" onClick={(e) => onButtonClick(e)}>Anterior</a>
                        <a className="viewBtn" id="Posterior" onClick={(e) => onButtonClick(e)}>Posterior</a>
                        <a className="viewBtn" id="Inferior" onClick={(e) => onButtonClick(e)}>Inferior</a>
                        <a className="viewBtn" id="Superior" onClick={(e) => onButtonClick(e)}>Superior</a>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn">Color
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a className="viewBtn dropdown-item-checked" id="!Gray" onClick={(e) => onButtonClick(e)}>Gray</a>
                        <a className="viewBtn" id="!Plasma" onClick={(e) => onButtonClick(e)}>Plasma</a>
                        <a className="viewBtn" id="!Viridis" onClick={(e) => onButtonClick(e)}>Viridis</a>
                        <a className="viewBtn" id="!Inferno" onClick={(e) => onButtonClick(e)}>Inferno</a>
                        <a className="viewBtn divider dropdown-item-checked" id="BackColor" onClick={(e) => onButtonClick(e)}>Dark Background</a>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn">Draw
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a className="viewBtn dropdown-item-checked" id="@Off" onClick={(e) => onButtonClick(e)}>Off</a>
                        <a className="viewBtn" id="@Red" onClick={(e) => onButtonClick(e)}>Red</a>
                        <a className="viewBtn" id="@Green" onClick={(e) => onButtonClick(e)}>Green</a>
                        <a className="viewBtn" id="@Blue" onClick={(e) => onButtonClick(e)}>Blue</a>
                        <a className="viewBtn" id="@Yellow" onClick={(e) => onButtonClick(e)}>Yellow</a>
                        <a className="viewBtn" id="@Cyan" onClick={(e) => onButtonClick(e)}>Cyan</a>
                        <a className="viewBtn" id="@Purple" onClick={(e) => onButtonClick(e)}>Purple</a>
                        <a className="viewBtn" id="@Erase" onClick={(e) => onButtonClick(e)}>Erase</a>
                        <a className="viewBtn" id="@Cluster" onClick={(e) => onButtonClick(e)}>Erase Cluster</a>
                        <a className="viewBtn divider dropdown-item-checked" id="|Snap" onClick={(e) => onButtonClick(e)}>ITKsnap Colors</a>
                        <a className="viewBtn" id="|Slicer" onClick={(e) => onButtonClick(e)}>Slicer3D Colors</a>
                        <a className="viewBtn divider dropdown-item-checked" id="DrawFilled" onClick={(e) => onButtonClick(e)}>Fill Outline</a>
                        <a className="viewBtn dropdown-item-checked" id="DrawOverwrite" onClick={(e) => onButtonClick(e)}>Pen Overwrites Existing</a>
                        <a className="viewBtn dropdown-item-checked" id="Translucent" onClick={(e) => onButtonClick(e)}>Translucent</a>
                        <a className="viewBtn" id="Growcut" onClick={(e) => onButtonClick(e)}>Grow Cut</a>
                        <a className="viewBtn" id="DrawOtsu" onClick={(e) => onButtonClick(e)}>Otsu</a>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn">Drag
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a className="viewBtn dropdown-item-checked" id="^contrast" onClick={(e) => onButtonClick(e)}>Contrast</a>
                        <a className="viewBtn" id="^measurement" onClick={(e) => onButtonClick(e)}>Measurement</a>
                        <a className="viewBtn" id="^pan" onClick={(e) => onButtonClick(e)}>Pan</a>
                        <a className="viewBtn" id="^none" onClick={(e) => onButtonClick(e)}>None</a>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn">Script
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a className="viewBtn dropdown-item-checked" id="_FLAIR" onClick={(e) => onButtonClick(e)}>FLAIR</a>
                        <a className="viewBtn" id="_mni152" onClick={(e) => onButtonClick(e)}>mni152</a>
                        <a className="viewBtn" id="_shear" onClick={(e) => onButtonClick(e)}>CT</a>
                        <a className="viewBtn" id="_ct_perfusion" onClick={(e) => onButtonClick(e)}>CT CBF</a>
                        <a className="viewBtn" id="_pcasl" onClick={(e) => onButtonClick(e)}>pCASL</a>
                        <a className="viewBtn" id="_mesh" onClick={(e) => onButtonClick(e)}>mesh</a>
                    </div>
                </div> */}
            </header>
            <main id="container">
                <Viewer imageUrl={url} nvObj={nv1} />
            </main>
            <footer id="location">
                &nbsp;
            </footer>
        </body>
    );

};

export default Drawer;