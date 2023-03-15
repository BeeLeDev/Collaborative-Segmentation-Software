import { useRef, useEffect, useState } from 'react'
import { Niivue } from '@niivue/niivue'
import { v4 } from 'uuid';

import Pusher from 'pusher-js';
const _location = (window.location != window.parent.location) ? document.referrer
  : document.location;
// here we make sure that location is a string
const channelname = 'mydrop-' + _location.href.split('?')[1];
function Viewer({ imageUrl, nvObj }) {
  const [pusher, setPusher] = useState(new Pusher('bb9db0457c7108272899', {
    cluster: 'us2',
    userAuthentication: { endpoint: "http://x.babymri.org/auth.php" },
    authEndpoint: "http://x.babymri.org/auth.php"
  }))
 const [channel, setChannel] = useState(pusher.subscribe('private-' + channelname))
  const canvas = useRef();
  let prevPos = { offsetX: 0, offsetY: 0 };
  let line = [];
  let userStrokeStyle = '#EE92C2';
  let guestStrokeStyle = '#F0C987';
  let userId = v4();



  /*  const handleLocationChange = (data) => {
     document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string;
   } */
  const nv = new Niivue({
    logging: true,
    dragAndDropEnabled: true,
    backColor: [0, 0, 0, 1],
    show3Dcrosshair: true,

  })

  /* const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
  const isFilled = true;
 */
  const onMouseDown = (e) => {
    console.log("mousedown", e)
    prevPos = { offsetX: e.offsetX, offsetY: e.offsetY }

  }
  const onMouseUp = (e) => {
    console.log("mouse up", e)
    console.log(nv)
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
    draw(prevPos, offSetData, userStrokeStyle);
    //xconsole.log("mouse move", e)
  }

  function draw(prevPos, currPos) {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;
    console.log("draw", nv)

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
    const volumeList = [
      {
        url: imageUrl,

      },
    ]

    nv.attachToCanvas(canvas.current);
    nv.loadVolumes(volumeList);
    nv.canvas.onmousedown = onMouseDown;
    nv.canvas.onmousemove = onMouseMove;
    nv.canvas.onmouseup = onMouseUp;
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
  }, [imageUrl])


  return (
    <canvas ref={canvas} height={480} width={640}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseUp}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove} />
  )

}

export default Viewer;
