import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import build from './gravityAnimatorBuilder';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App animator={build(0)}/>
  </React.StrictMode>
);
