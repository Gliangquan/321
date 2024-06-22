import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PdfPage from './pages/PdfPage';
import reportWebVitals from './reportWebVitals';

// 将React组件挂载到DOM元素上
const root = ReactDOM.createRoot(document.getElementById('root'));


// 严格模式（Strict Mode）：在开发模式下，React 的严格模式会故意调用某些生命周期方法两次，
// 以帮助你发现副作用的问题。具体来说，如果你在 index.js 中使用了 
// <React.StrictMode> 包裹你的应用，那么 useEffect 会在组件挂载时被调用两次。
root.render(
  // <React.StrictMode>
    <PdfPage />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
