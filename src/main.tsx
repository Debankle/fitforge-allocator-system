import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import CoreServiceProvider from './CoreServiceContext';
import App from './App.tsx';
import './index.css';

ReactDOM.render(
  <StrictMode>
    <CoreServiceProvider>
      <App />
    </CoreServiceProvider>
  </StrictMode>,
  document.getElementById('root')
);
