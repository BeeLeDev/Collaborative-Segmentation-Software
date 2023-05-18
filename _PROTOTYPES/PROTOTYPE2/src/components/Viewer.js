import { useRef, useEffect } from 'react'
import { Niivue } from '@niivue/niivue'

function Viewer ({ imageUrl ,nvObj}){
  
  const canvas = useRef()
  useEffect(() => {
    const volumeList = [
      {
        url: imageUrl,
       
      },
    ]
    const nv = nvObj ? nvObj : new Niivue()
    nv.attachToCanvas(canvas.current);
    nv.loadVolumes(volumeList);
  }, [imageUrl])
  
  
  return (
    <canvas ref={canvas} height={480} width={640} />
  )  

}

export default Viewer;
