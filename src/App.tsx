import React from 'react';
import { AnimatedCanvas } from './components/AnimatedCanvas';
import { GravityAnimator } from './components/animator';
function App(props: any) {
  const { animator } = props;
  return (
    <div>
      <AnimatedCanvas animator={animator} />
    </div>
  );
}

export default App;
