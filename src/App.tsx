import React from 'react';
import { AnimatedCanvas } from './components/AnimatedCanvas';
import { Animator } from './animators/animator';
import { useState } from 'react';

function App(props: any) {

  const [animator, setAnimator] = useState(props.animator);



  // const onLeaveTrace(e: any): void {
  //   const leaveTrace = animator.leaveTrace;
  //   animator.setLeaveTrace(!leaveTrace);
  // } 



  return (
    <div className="app">
      <div>
        <button onClick={ e => animator.setLeaveTrace(!animator.leaveTrace) }>Leave Trace</button>
        <button onClick={ e => animator.togglePause() }>Toggle Pause</button>
      </div>
      <AnimatedCanvas animator={animator} />
    </div>
  );
}

export default App;
