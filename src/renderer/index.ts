import ReactDOM from 'react-dom';
import React from 'react';
import { Application } from './ui/Application';

const styles = document.createElement('style');
styles.innerText = `
html { height: 100%; }
body { margin: 0; min-height: 100%; display: flex; }
#app { display: flex; flex-direction: column; flex: auto; }
`;
document.head.appendChild(styles);

ReactDOM.render(
  React.createElement(Application),
  document.getElementById('app'),
);
