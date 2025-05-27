// Utility functions for canvas operations

// Helper function to get all elements in current screen (including nested ones)
export const getAllElementsInScreen = (elements) => {
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
};

// Copy canvas data to clipboard
export const copyCanvasToClipboard = async (app, appId, currentScreen, screens, selectedElement, allElements) => {
  try {
    const canvasData = {
      app: {
        name: app?.name,
        id: appId,
        description: app?.description
      },
      currentScreen: {
        id: currentScreen?.id,
        name: currentScreen?.name,
        elementCount: currentScreen?.elements?.length || 0
      },
      elements: currentScreen?.elements || [],
      allScreens: screens.map(screen => ({
        id: screen.id,
        name: screen.name,
        elementCount: screen.elements?.length || 0
      })),
      selectedElement: selectedElement ? {
        id: selectedElement.id,
        type: selectedElement.type,
        properties: selectedElement.properties,
        conditions: selectedElement.conditions,
        renderType: selectedElement.renderType,
        contentType: selectedElement.contentType,
        repeatingConfig: selectedElement.repeatingConfig,
        children: selectedElement.children
      } : null,
      metadata: {
        timestamp: new Date().toISOString(),
        totalElements: allElements.length,
        hasConditionalElements: (currentScreen?.elements || []).some(el => el.renderType === 'conditional'),
        hasRepeatingContainers: (currentScreen?.elements || []).some(el => 
          el.type === 'container' && el.contentType === 'repeating'
        )
      }
    };

    const formattedJSON = JSON.stringify(canvasData, null, 2);
    await navigator.clipboard.writeText(formattedJSON);
    
    console.log('Canvas data copied to clipboard:', canvasData);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw new Error('Failed to copy canvas data to clipboard');
  }
};