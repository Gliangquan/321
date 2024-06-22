import React from 'react';

const PdfPage = () => {
  return (
    <div className="-pdf-page">
      <iframe 
        title="pdf-viewer"
        src={`${process.env.PUBLIC_URL}/viewer/web/viewer.html?file=${process.env.PUBLIC_URL}/pdfs/demo.pdf`}
        width="100%"
        height="600px"
      />
    </div>
  );
};

export default PdfPage;