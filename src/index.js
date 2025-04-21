import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { TableExp } from './TableExp';
import TableGPT from './TableGPT';
import DataAnalyzer from './History';
import { Parse } from './Parse';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DataAnalyzer />
    {/*<TableGPT />
    <TableExp />
    <Parse />*/}
  </React.StrictMode>
);