import Viewer from './components/Viewer';
import Drawer from './components/Drawer';

function App() {
  const someUrl = "https://niivue.github.io/niivue-demo-images/visiblehuman.nii.gz";
  //const someUrl = "https://niivue.github.io/niivue-demo-images/mni152.nii.gz";
  return (
    <Drawer url={someUrl}/>
   // <Viewer imageUrl={someUrl}> </Viewer>

  );
}

export default App;
