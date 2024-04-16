import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { TableExp } from './TableExp';
import TableGPT from './TableGPT';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TableGPT />
    <TableExp />
  </React.StrictMode>
);