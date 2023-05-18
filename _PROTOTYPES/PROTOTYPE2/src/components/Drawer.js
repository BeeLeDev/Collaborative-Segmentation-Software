import { Niivue, NVImage, NVMesh } from '@niivue/niivue';
import { useRef, useEffect } from 'react';
import Viewer from './Viewer';

function Drawer({ url }) {

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
    }, [volumeList1])

    function toggleGroup(id) {
        let buttons = document.getElementsByClassName("viewBtn")
        let char0 = id.charAt(0)
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].id.charAt(0) !== char0)
                continue
            buttons[i].classList.remove("dropdown-item-checked")
            if (buttons[i].id === id)
                buttons[i].classList.add("dropdown-item-checked")
        }
    } // toggleGroup()
    async function onButtonClick(event) {
        if (isTouchDevice) {
            console.log('Touch device: click menu to close menu')
            /*var el = this.parentNode
            el.style.display = "none"
            setTimeout(function() { //close menu
              //el.style.removeProperty("display")
              //el.style.display = "block"
            }, 500)*/
        }
        if (event.target.id === "SaveDraw") {
            nv1.saveImage('draw.nii', true)
            return
        }
        if (event.target.id === "SaveBitmap") {
            nv1.saveScene('ScreenShot.png')
            return
        }
        if (event.target.id === "ShowHeader") {
            alert(nv1.volumes[0].hdr.toFormattedString())
            return
        }
        if (event.target.id === "Colorbar") {
            nv1.opts.isColorbar = !nv1.opts.isColorbar
            event.srcElement.classList.toggle("dropdown-item-checked")
            nv1.drawScene()
            return
        }
        if (event.target.id === "Radiological") {
            nv1.opts.isRadiologicalConvention = !nv1.opts.isRadiologicalConvention
            event.srcElement.classList.toggle("dropdown-item-checked")
            nv1.drawScene()
            return
        }
        if (event.target.id === "Crosshair") {
            nv1.opts.show3Dcrosshair = !nv1.opts.show3Dcrosshair
            event.srcElement.classList.toggle("dropdown-item-checked")
            nv1.drawScene()
        }
        if (event.target.id === "ClipPlane") {
            if (nv1.scene.clipPlaneDepthAziElev[0] > 1)
                nv1.setClipPlane([0.3, 270, 0])
            else
                nv1.setClipPlane([2, 270, 0])
            nv1.drawScene()
            return
        }
        if (event.target.id.charAt(0) === '!') { // set color scheme
            nv1.volumes[0].colorMap = event.target.id.substr(1)
            nv1.updateGLVolume()
            toggleGroup(event.target.id)
            return
        }
        if (event.target.id === "Undo") {
            nv1.drawUndo()
        }
        if (event.target.id.charAt(0) === '|') { //sliceType
            if (event.target.id === "|Slicer")
                nv1.setDrawColormap("_slicer3d")
            else
                nv1.setDrawColormap("_itksnap")
        }
        if (event.target.id.charAt(0) === '@') { //sliceType
            if (event.target.id === "@Off")
                nv1.setDrawingEnabled(false)
            else
                nv1.setDrawingEnabled(true)
            if (event.target.id === "@Erase")
                nv1.setPenValue(0, isFilled);
            if (event.target.id === "@Red")
                nv1.setPenValue(1, isFilled);
            if (event.target.id === "@Green")
                nv1.setPenValue(2, isFilled);
            if (event.target.id === "@Blue")
                nv1.setPenValue(3, isFilled);
            if (event.target.id === "@Yellow")
                nv1.setPenValue(4, isFilled);
            if (event.target.id === "@Cyan")
                nv1.setPenValue(5, isFilled);
            if (event.target.id === "@Purple")
                nv1.setPenValue(6, isFilled);
            if (event.target.id === "@Cluster")
                nv1.setPenValue(-0, isFilled);
            toggleGroup(event.target.id)
        } //Draw Color
        if (event.target.id === "Growcut")
            nv1.drawGrowCut();
        if (event.target.id === "Translucent") {
            if (nv1.drawOpacity > 0.75)
                nv1.drawOpacity = 0.5
            else
                nv1.drawOpacity = 1.0;
            nv1.drawScene()
            event.srcElement.classList.toggle("dropdown-item-checked")
            return
        }
        if (event.target.id === "DrawOtsu") {
            let levels = parseInt(prompt("Segmentation classes (2..4)", "3"));
            nv1.drawOtsu(levels);
        }
        if (event.target.id === "RemoveHaze") {
            let level = parseInt(prompt("Remove Haze (1..5)", "5"));
            nv1.removeHaze(level);
        }
        if (event.target.id === "DrawFilled") {
            isFilled = !isFilled;
            nv1.setPenValue(nv1.opts.penValue, isFilled);
            event.srcElement.classList.toggle("dropdown-item-checked")
            return
        }
        if (event.target.id === "DrawOverwrite") {
            nv1.drawFillOverwrites = !nv1.drawFillOverwrites;
            event.srcElement.classList.toggle("dropdown-item-checked")
            return
        }
        if (event.target.id.charAt(0) === '|') { //sliceType
            if (event.target.id === "|Axial")
                nv1.setSliceType(nv1.sliceTypeAxial)
            if (event.target.id === "|Coronal")
                nv1.setSliceType(nv1.sliceTypeCoronal)
            if (event.target.id === "|Sagittal")
                nv1.setSliceType(nv1.sliceTypeSagittal)
            if (event.target.id === "|Render")
                nv1.setSliceType(nv1.sliceTypeRender)
            if (event.target.id === "|MultiPlanar") {
                nv1.opts.multiplanarForceRender = false
                nv1.setSliceType(nv1.sliceTypeMultiplanar)
            }
            if (event.target.id === "|MultiPlanarRender") {
                nv1.opts.multiplanarForceRender = true
                nv1.setSliceType(nv1.sliceTypeMultiplanar)
            }
            toggleGroup(event.target.id)
        } //sliceType
        if (event.target.id === "WorldSpace") {
            nv1.setSliceMM(!nv1.opts.isSliceMM);
            event.srcElement.classList.toggle("dropdown-item-checked")
            return
        }
        if (event.target.id === "Interpolate") {
            nv1.setInterpolation(!nv1.opts.isNearestInterpolation)
            event.srcElement.classList.toggle("dropdown-item-checked")
            return
        }
        if (event.target.id === "Left")
            nv1.moveCrosshairInVox(-1, 0, 0)
        if (event.target.id === "Right")
            nv1.moveCrosshairInVox(1, 0, 0)
        if (event.target.id === "Posterior")
            nv1.moveCrosshairInVox(0, -1, 0)
        if (event.target.id === "Anterior")
            nv1.moveCrosshairInVox(0, 1, 0)
        if (event.target.id === "Inferior")
            nv1.moveCrosshairInVox(0, 0, -1)
        if (event.target.id === "Superior")
            nv1.moveCrosshairInVox(0, 0, 1)
        if (event.target.id === "BackColor") {
            if (nv1.opts.backColor[0] < 0.5)
                nv1.opts.backColor = [1, 1, 1, 1]
            else
                nv1.opts.backColor = [0, 0, 0, 1]
            nv1.drawScene()
            event.srcElement.classList.toggle("dropdown-item-checked")
            return
        }
        if (event.target.id.charAt(0) === '^') { //drag mode
            let s = event.target.id.substr(1)
            switch (s) {
                case "none":
                    nv1.opts.dragMode = nv1.dragModes.none
                    break
                case "contrast":
                    nv1.opts.dragMode = nv1.dragModes.contrast
                    break
                case "measurement":
                    nv1.opts.dragMode = nv1.dragModes.measurement
                    break
                case "pan":
                    nv1.opts.dragMode = nv1.dragModes.pan
                    break
            }
            toggleGroup(event.target.id)
        } //drag mode
        if (event.target.id === "_mesh") {
            volumeList1[0].url = '../demos/images//mni152.nii.gz'
            await nv1.loadVolumes(volumeList1)
            nv1.loadMeshes([
                { url: "../demos/images/BrainMesh_ICBM152.lh.mz3", rgba255: [200, 162, 255, 255] },
                { url: "../demos/images/dpsv.trx", rgba255: [255, 255, 255, 255] },
            ])
            toggleGroup(event.target.id)
        } else if (event.target.id.charAt(0) === '_') { //example image
            nv1.meshes = [] //close open meshes
            let root = '../demos/images/'
            let s = event.target.id.substr(1)
            let img = root + s + '.nii.gz'
            console.log('Loading ' + img)
            volumeList1[0].url = img
            nv1.loadVolumes(volumeList1)
            toggleGroup(event.target.id)
            nv1.updateGLVolume()
        } //example image
    } // onButtonClick()

    return (
        <body>
            <header>
                <div className="dropdown">
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
                        <a className="viewBtn dropdown-item-checked" id="^contrast" onClick={(e)=>onButtonClick(e)}>Contrast</a>
                        <a className="viewBtn" id="^measurement" onClick={(e)=>onButtonClick(e)}>Measurement</a>
                        <a className="viewBtn" id="^pan" onClick={(e)=>onButtonClick(e)}>Pan</a>
                        <a className="viewBtn" id="^none" onClick={(e)=>onButtonClick(e)}>None</a>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn">Script
                        <i className="fa fa-caret-down" />
                    </button>
                    <div className="dropdown-content">
                        <a className="viewBtn dropdown-item-checked" id="_FLAIR" onClick={(e)=>onButtonClick(e)}>FLAIR</a>
                        <a className="viewBtn" id="_mni152" onClick={(e)=>onButtonClick(e)}>mni152</a>
                        <a className="viewBtn" id="_shear" onClick={(e)=>onButtonClick(e)}>CT</a>
                        <a className="viewBtn" id="_ct_perfusion" onClick={(e)=>onButtonClick(e)}>CT CBF</a>
                        <a className="viewBtn" id="_pcasl" onClick={(e)=>onButtonClick(e)}>pCASL</a>
                        <a className="viewBtn" id="_mesh" onClick={(e)=>onButtonClick(e)}>mesh</a>
                    </div>
                </div>
            </header>
            <main id="container">
                <Viewer imageUrl={url} nvObj={nv1}/>
            </main>
            <footer id="location">
                &nbsp;
            </footer>
        </body>
    );

};

export default Drawer;