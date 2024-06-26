import React from 'react';

function AnnotationItem({ data }) {
  const annotationStyle = {
    height: '70px',
    width: '330px',
    border: '1px solid gray',
    borderRadius: '5px',
    position: 'absolute',
    top: `${data.ly}px`, 
  };

  const titleDivStyle = {
    display: 'flex',
    justifyContent: 'space-between',
  };

  const nameDivStyle = {
    fontSize: 'small',
    textAlign: 'left',
    maxWidth: '50%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const timeDivStyle = {
    fontSize: 'small',
    textAlign: 'right',
    maxWidth: '50%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const contentInputStyle = {
    height: '25px',
    resize: 'none',
    border: 'none',
  };

  return (
    <div className="righttext" style={annotationStyle}>
      <div className="rightTextTitle" style={titleDivStyle}
        data-seq={data.seq}
        data-x1={data.lx}
        data-y1={data.ly}
        data-x2={data.rx}
        data-y2={data.ry}
        data-selected-text={data.pageText}
        data-content-text={data.contentText}
        data-page-num={data.pageNum}
        data-highlight-x1={data.highlightX1}
        data-highlight-y1={data.highlightY1}
        data-highlight-width={data.highlightWidth}
        data-highlight-height={data.highlightHeight}
        data-staff-name={data.staffName}
        data-create-datetime={data.createDatetime}
      >
        <div id="nameDiv" style={nameDivStyle}>{data.staffName}</div>
        <div id="timeDiv" style={timeDivStyle}>{data.createDatetime}</div>
      </div>
      <textarea 
        className="rightTextContent" 
        data-seq={data.seq} 
        defaultValue={data.contentText} 
        style={contentInputStyle} 
      />
    </div>
  );
}

export default AnnotationItem;