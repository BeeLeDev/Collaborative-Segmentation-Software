
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

    const v = new Viewer(document.getElementById('viewer'), url);

    async function loadView() {
        await v.initialize().then(() => {
            console.log("succesful")
            jSuites.loading.show();
            const d = new RealTimeDrawer(v);
        }).catch(err => console.log("error:: ", err))
            .finally(jSuites.loading.hide())
    }

    loadView();
};
