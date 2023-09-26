import React from 'react';
import { AnimatedCanvas } from './components/AnimatedCanvas';
import { GravityAnimator } from './components/animator';
import { Button } from './components/Button';
import { useState } from 'react';

function App(props: any) {

  const [animator, setAnimator] = useState(props.animator);



  function onLeaveTrace(e: any): void {
    
    console.log("clicked")
    const leaveTrace = animator.leaveTrace;
    animator.setLeaveTrace(!leaveTrace);
  } 

  return (
    <div className="app">
      <Button  name='Leave Trace' onClick={onLeaveTrace}/>
      <AnimatedCanvas animator={animator} />

    </div>
  );
}

export default App;
