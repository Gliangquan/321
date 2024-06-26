import React, { useState, useRef, useEffect } from 'react';
import AnnotationItem from '../components/AnnotationItem'
import './PdfPage.css';
import leftIcon from '../assets/svg/chevron-left-svgrepo-com.svg';
import rightIcon from '../assets/svg/chevron-right-svgrepo-com.svg';

const PdfPage = () => {
  const [showAnnotations, setShowAnnotations] = useState(false);
  const iframeRef = useRef(null);
  const buttonRef = useRef(null);
  const [buttonIcon, setButtonIcon] = useState(leftIcon);

  const annotationData = { staffName: '姓名', createDatetime: '日期' ,contentText: '内容' };

  const toggleAnnotations = () => {
    setShowAnnotations(!showAnnotations);
  };

  useEffect(() => {
    const iframeWidth = iframeRef.current.parentElement.offsetWidth - 300;
    iframeRef.current.style.width = showAnnotations ? `${iframeWidth}px` : '100%';

    const buttonRight = showAnnotations
      ? `${iframeWidth - 30}px` 
      : 'calc(100% - 30px)';
    console.log(buttonRight);
    buttonRef.current.style.left = buttonRight;

    setButtonIcon(showAnnotations ? rightIcon : leftIcon);

  }, [showAnnotations]);

  return (
    <div className="pdf-page">
      <iframe
        ref={iframeRef}
        title="pdf-viewer"
        src={`${process.env.PUBLIC_URL}/viewer/web/viewer.html?file=${process.env.PUBLIC_URL}/pdfs/demo.pdf`}
        height="600px"
      />

      <div className="annotation-panel" style={{ display: showAnnotations ? 'block' : 'none' }}>
        <AnnotationItem data={annotationData} /> 
      </div>

      <button 
        ref={buttonRef}
        className="annotation-button" 
        onClick={toggleAnnotations}>
          <img src={buttonIcon} className="btnIcon" alt="logo" />
      </button>
    </div>
  );
};

export default PdfPage;