import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PdfPage from './pages/PdfPage';
import reportWebVitals from './reportWebVitals';

// 将React组件挂载到DOM元素上
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PdfPage />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
