

window.onload = function () {

    var url = 'https://niivue.github.io/niivue-demo-images/visiblehuman.nii.gz';

    var query = window.location.search;
    var params = new URLSearchParams(query);
    var data = params.get('data');
    var filename = params.get('filename');

    if (data) {
        console.log('Loading', data);
        url = data;
    }

    var v = new Viewer(document.getElementById('viewer'), url);

    var d = new RealTimeDrawer(v); // attach drawer


};
