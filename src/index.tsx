import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Body, Coord, GravityAnimator}  from './components/animator'
import { useState } from 'react';



const abodies:Body[] = [
  new Body(1.989e30, 696340000, {x:0, y:0} as Coord, {x:0, y:0} as Coord, '#0000ff'),

  // new Body(5.972e24, 6371000, {x:0, y:0} as Coord, {x:0, y:0} as Coord,'#ff0000'),
  // new Body(7.3477e22, 1737400, {x:384 400 000, y:0} as Coord, {x:0, y:1023} as Coord, '#00ff00'),

  new Body(5.972e24, 6371000, {x:149597870700, y:0} as Coord, {x:0, y:30000} as Coord,'#ff0000'),
  new Body(7.3477e22, 1737400, {x: 149597870700+384400000, y:0} as Coord, {x:0, y: 30000+1023} as Coord, '#00ff00'),

];

const bodies:Body[] = [
  new Body(1.989e30, 696340000, {x:0, y:0} as Coord, {x:0, y:0} as Coord, '#00ffff'),
  // merc
  new Body(3.3022e23, 4878000/2, {x:57900000000, y:0} as Coord, {x:0, y:47400} as Coord,'#aaaaaa'),
  // venus
  new Body(4.869e24, 12756000/2, {x:0, y:108200000000} as Coord, {x:-35000, y:0} as Coord, '#00ff00'),
  // earth  
  new Body(5.974e24, 12756000/2, {x:-149597870700, y:0} as Coord, {x:0, y:-30000} as Coord,'#0000ff'),
  // moon
  new Body(7.3477e22, 1737400, {x: -149597870700+384400000, y:0} as Coord, {x:0, y: -30000+1023} as Coord, '#00ff00'),


  // // mars
  // new Body(6.4185e23, 6371000/2, {x:0, y:-227900000000} as Coord, {x:24100, y:0} as Coord,'#ff0000'),
  // // Jupiter
  // new Body(1898e24, 142984000/2, {x:0, y:-778500000000} as Coord, {x:13100, y:0} as Coord,'#ff8800'),
  // // Saturn
  // new Body(568e24, 120536000/2, {x:0, y:-1432000000000} as Coord, {x:9700, y:0} as Coord,'#ff8888'),
  // // Uranus
  // new Body(86.8e24, 51118000/2, {x:0, y:-2867000000000} as Coord, {x:6800, y:0} as Coord,'#0a88ff'),
  // // Neptune
  // new Body(102e24, 49528000/2, {x:0, y:  -4515000000000} as Coord, {x:5400, y:0} as Coord,'#ff0000'),
  // // Pluto
  //new Body(0.0130e24, 2376000/2, {x:0, y:-5906400000000} as Coord, {x:4700, y:0} as Coord,'#0000ff'),

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
