import React, { useEffect } from 'react';

const PdfPage = () => {
  useEffect(() => {
    const pdfUrl = '../assets/pdf/web/viewer.html?file=../assets/pdf/demo.pdf';
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.width = '100%';
    iframe.height = '500px';
    iframe.title = 'PDF Viewer';

    const pdfPageDiv = document.querySelector('.pdf-page');
    if (pdfPageDiv) {
      // console.log(1);
      // pdfPageDiv.appendChild(iframe);
    }
  }, []);
  
  return (
    <div className="pdf-page">
    </div>
  );
};

export default PdfPage;
