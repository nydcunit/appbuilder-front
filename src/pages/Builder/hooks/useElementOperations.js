import { useCallback } from 'react';
import { createElement } from '../../../elements';

export const useElementOperations = (screens, currentScreenId, updateScreens, setSelectedElement, setShowPropertiesPopup) => {
  
  const addElementToCanvas = useCallback((elementType) => {
    const newElement = createElement(elementType);
    if (!newElement) return;
    
    updateScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? { ...screen, elements: [...screen.elements, newElement] }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  const addElementToContainer = useCallback((elementType, containerId) => {
    const newElement = createElement(elementType);
    if (!newElement) return;
    
    updateScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: addToElementInTree(screen.elements, containerId, newElement)
          }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  const moveExistingElementToCanvas = useCallback((element) => {
    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, element.id)
          }
        : screen
    ));

    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? { ...screen, elements: [...screen.elements, element] }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  const moveExistingElementToContainer = useCallback((element, containerId) => {
    if (element.id === containerId) return;

    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, element.id)
          }
        : screen
    ));

    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: addToElementInTree(screen.elements, containerId, element)
          }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  // FIXED: Enhanced updateElement with better logging and proper merging
  const updateElement = useCallback((elementId, updates) => {
    console.log('🔧 === ELEMENT UPDATE START ===');
    console.log('🔧 Element ID:', elementId);
    console.log('🔧 Updates being applied:', JSON.stringify(updates, null, 2));
    
    const updatedScreens = screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: updateElementInTree(screen.elements, elementId, updates)
          }
        : screen
    );
    
    console.log('🔧 Updated screens state calculated');
    updateScreens(updatedScreens);

    // Update selected element if it's the one being updated
    setSelectedElement(prevSelected => {
      if (prevSelected && prevSelected.id === elementId) {
        const updatedElement = findElementInTree(updatedScreens.find(s => s.id === currentScreenId)?.elements || [], elementId);
        if (updatedElement) {
          console.log('🔧 Updated selected element:', JSON.stringify(updatedElement, null, 2));
          return updatedElement;
        }
      }
      return prevSelected;
    });
    
    console.log('🔧 === ELEMENT UPDATE END ===');
  }, [screens, currentScreenId, updateScreens, setSelectedElement]);

  const deleteElement = useCallback((elementId) => {
    updateScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, elementId)
          }
        : screen
    ));
    
    setSelectedElement(prevSelected => {
      if (prevSelected?.id === elementId) {
        setShowPropertiesPopup(false);
        return null;
      }
      return prevSelected;
    });
  }, [screens, currentScreenId, updateScreens, setSelectedElement, setShowPropertiesPopup]);

  // Helper function to get all elements in current screen (including nested ones)
  const getAllElementsInScreen = useCallback((elements) => {
    const allElements = [];
    
    const traverse = (elementList) => {
      elementList.forEach(element => {
        allElements.push(element);
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      });
    };
    
    traverse(elements);
    return allElements;
  }, []);

  // Helper functions
  const addToElementInTree = (elements, targetId, newElement) => {
    return elements.map(element => {
      if (element.id === targetId) {
        return {
          ...element,
          children: [...(element.children || []), newElement]
        };
      }
      if (element.children) {
        return {
          ...element,
          children: addToElementInTree(element.children, targetId, newElement)
        };
      }
      return element;
    });
  };

  // FIXED: Enhanced updateElementInTree with better logging and deep merging
  const updateElementInTree = (elements, targetId, updates) => {
    return elements.map(element => {
      if (element.id === targetId) {
        console.log('🎯 Found target element:', element.id);
        console.log('📝 Current element state:', JSON.stringify(element, null, 2));
        console.log('🔄 Applying updates:', JSON.stringify(updates, null, 2));
        
        // FIXED: Proper deep merging for complex objects like conditions
        const updatedElement = {
          ...element,
          ...updates
        };
        
        // Special handling for conditions array to ensure proper merging
        if (updates.conditions && Array.isArray(updates.conditions)) {
          updatedElement.conditions = updates.conditions;
          console.log('🔄 Updated conditions:', JSON.stringify(updatedElement.conditions, null, 2));
        }
        
        // Special handling for properties object to ensure proper merging
        if (updates.properties) {
          updatedElement.properties = {
            ...element.properties,
            ...updates.properties
          };
          console.log('🔄 Updated properties:', JSON.stringify(updatedElement.properties, null, 2));
        }
        
        console.log('✅ Final updated element:', JSON.stringify(updatedElement, null, 2));
        return updatedElement;
      }
      if (element.children) {
        return {
          ...element,
          children: updateElementInTree(element.children, targetId, updates)
        };
      }
      return element;
    });
  };

  const removeElementFromTree = (elements, targetId) => {
    return elements
      .filter(element => element.id !== targetId)
      .map(element => {
        if (element.children) {
          return {
            ...element,
            children: removeElementFromTree(element.children, targetId)
          };
        }
        return element;
      });
  };

  const findElementInTree = (elements, targetId) => {
    for (const element of elements) {
      if (element.id === targetId) {
        return element;
      }
      if (element.children) {
        const found = findElementInTree(element.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  return {
    addElementToCanvas,
    addElementToContainer,
    moveExistingElementToCanvas,
    moveExistingElementToContainer,
    updateElement,
    deleteElement,
    getAllElementsInScreen
  };
};