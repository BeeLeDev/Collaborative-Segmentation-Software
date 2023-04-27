
class Viewer {
  constructor(element, url) {
    //instance of niivue
    var nv = new niivue.Niivue({});

    this.nv = nv;

    //attach object to viewer
    nv.attachToCanvas(element);

    //set default view to coronal
    nv.setSliceType(nv.sliceTypeCoronal);

    this.data = [{
      url: url, // https://niivue.github.io/niivue-demo-images/visiblehuman.nii.gz,
      colorMap: 'gray',
      opacity: 1,
      visible: true
    }];

    nv.drawOpacity = 1.0;
    this.view = 1;


  }
};

Viewer.prototype.initialize = async function () {
  await this.nv.loadVolumes(this.data).then(() => {
    console.log("done!!")
  }).catch(err => console.log("error loading url", err));
}


Viewer.prototype.changeView = function () {

  this.view++;

  if (this.view > 4) {
    this.view = 0;
  }

  this.nv.setSliceType(this.view);

};
