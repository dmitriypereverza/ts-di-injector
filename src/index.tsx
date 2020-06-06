import React from 'react';
import ReactDOM from 'react-dom';
import "reflect-metadata";
import App from './App';
import { buildContainer } from "./DI/diContainer";
import diConfig from "./diConfig";

buildContainer(diConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
