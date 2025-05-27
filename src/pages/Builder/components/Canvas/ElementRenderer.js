import React from 'react';

const ElementRenderer = ({ elements, renderElement }) => {
  if (!elements || elements.length === 0) {
    return null;
  }

  return (
    <>
      {elements.map(element => renderElement(element))}
    </>
  );
};

export default ElementRenderer;