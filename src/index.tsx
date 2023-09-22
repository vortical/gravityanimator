import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Body, Coord, GravityAnimator}  from './components/animator'

const bodies:Body[] = [
  new Body(7.3477e22, 1737400, {x:384400000, y:0} as Coord, {x:0, y:1023} as Coord, '#00ff00'),
  new Body(5.972e24, 6371000, {x:0, y:0} as Coord, {x:0, y:0} as Coord,'#ff0000'),

];
const animator: GravityAnimator = new GravityAnimator(bodies);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App animator={animator}/>
  </React.StrictMode>
);
