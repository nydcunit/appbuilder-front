import { ContainerElement } from './container/Container';
import { TextElement } from './text/Text';

// Export all available elements
export const availableElements = [
  ContainerElement,
  TextElement
];

// Helper function to get element definition by type
export const getElementByType = (type) => {
  return availableElements.find(element => element.type === type);
};

// Helper function to create new element instance
export const createElement = (type) => {
  const elementDef = getElementByType(type);
  if (!elementDef) return null;
  
  return {
    id: Date.now().toString(),
    type: elementDef.type,
    properties: elementDef.getDefaultProps(),
    children: elementDef.getDefaultChildren()
  };
};