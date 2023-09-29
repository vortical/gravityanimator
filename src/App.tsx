import React from 'react';
import { AnimatedCanvas } from './components/AnimatedCanvas';
import { useState } from 'react';

function App(props: any) {
  const [animator, setAnimator] = useState(props.animator);

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
