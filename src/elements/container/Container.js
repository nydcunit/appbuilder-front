import React, { useState, useEffect, useRef } from 'react';
import ContainerPropertiesPanel from './ContainerPropertiesPanel';
import { getElementByType } from '../../elements';

// FIXED: Get properties for rendering - now correctly handles conditional properties based on evaluation
const getRenderProperties = (element, matchedConditionIndex = null) => {
  console.log('🎨 Getting render properties for element:', element.id);
  console.log('🎨 Element renderType:', element.renderType);
  console.log('🎨 Element conditions:', element.conditions?.length || 0);
  console.log('🎨 Matched condition index:', matchedConditionIndex);
  
  if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
    // FIXED: Use the matched condition index if provided
    let conditionIndex = matchedConditionIndex;
    
    // Fallback to first condition if no specific match provided (for builder mode)
    if (conditionIndex === null || conditionIndex === undefined) {
      conditionIndex = 0;
      console.log('🎨 No matched condition index provided, defaulting to first condition for builder mode');
    }
    
    const selectedCondition = element.conditions[conditionIndex];
    console.log(`🎨 Using condition ${conditionIndex + 1}:`, selectedCondition);
    console.log(`🎨 Condition ${conditionIndex + 1} properties:`, selectedCondition?.properties);
    
    if (selectedCondition && selectedCondition.properties) {
      const mergedProperties = { ...element.properties, ...selectedCondition.properties };
      console.log('🎨 Merged properties:', mergedProperties);
      return mergedProperties;
    }
  }
  
  const baseProperties = element.properties || {};
  console.log('🎨 Using base properties:', baseProperties);
  return baseProperties;
};

export const ContainerElement = {
  type: 'container',
  label: 'Container',
  icon: '📦',
  
  // Default properties when element is created
  getDefaultProps: () => ({
    // Layout
    orientation: 'column',
    width: 'auto',
    height: 'auto',
    verticalAlignment: 'flex-start',
    horizontalAlignment: 'flex-start',
    
    // Styling
    backgroundColor: '#ffffff',
    
    // Spacing
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    
    // Border Radius
    borderRadiusTopLeft: 0,
    borderRadiusTopRight: 0,
    borderRadiusBottomLeft: 0,
    borderRadiusBottomRight: 0,
    
    // Border
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderTopColor: '#ccc',
    borderBottomColor: '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
    
    // Shadow
    shadowColor: '#000000',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    
    // Active state properties (for slider mode)
    activeBackgroundColor: '#ffffff',
    activeMarginTop: 0,
    activeMarginBottom: 0,
    activeMarginLeft: 0,
    activeMarginRight: 0,
    activePaddingTop: 15,
    activePaddingBottom: 15,
    activePaddingLeft: 15,
    activePaddingRight: 15,
    activeBorderRadiusTopLeft: 0,
    activeBorderRadiusTopRight: 0,
    activeBorderRadiusBottomLeft: 0,
    activeBorderRadiusBottomRight: 0,
    activeBorderTopWidth: 1,
    activeBorderBottomWidth: 1,
    activeBorderLeftWidth: 1,
    activeBorderRightWidth: 1,
    activeBorderTopStyle: 'dashed',
    activeBorderBottomStyle: 'dashed',
    activeBorderLeftStyle: 'dashed',
    activeBorderRightStyle: 'dashed',
    activeBorderTopColor: '#ccc',
    activeBorderBottomColor: '#ccc',
    activeBorderLeftColor: '#ccc',
    activeBorderRightColor: '#ccc',
    activeShadowColor: '#000000',
    activeShadowX: 0,
    activeShadowY: 0,
    activeShadowBlur: 0
  }),
  
  getDefaultChildren: () => ([]),

  // FIXED: Render function now accepts matchedConditionIndex parameter
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null, matchedConditionIndex = null, isExecuteMode = false, isActiveSlide = false, isActiveTab = false) => {
    const { onClick, onDelete, onDragOver, onDragLeave, onDrop, onDragStart } = handlers;
    
    console.log('🔍 Container render called:', {
      elementId: element.id,
      isExecuteMode,
      isActiveSlide,
      containerType: element.containerType,
      hasActiveProps: !!element.properties?.activeBackgroundColor
    });
    
    // FIXED: Use the fixed getRenderProperties function with matched condition index
    let props = getRenderProperties(element, matchedConditionIndex);
    const contentType = element.contentType || 'fixed';
    
    // Check if this element is in an active slide by checking parent hierarchy
    const checkIfInActiveSlide = () => {
      if (!isExecuteMode) return false;
      
      // Check if any parent element indicates this is in an active slide
      // This works by checking the element's ID pattern for repeating containers
      if (element.id && element.id.includes('_instance_')) {
        // Extract the instance number from repeating container ID
        const match = element.id.match(/_instance_(\d+)/);
        if (match) {
          const instanceIndex = parseInt(match[1]);
          // Check if there's a parent slider container tracking this
          const parentMatch = element.id.match(/^([^_]+)_instance/);
          if (parentMatch) {
            const parentId = parentMatch[1];
            // Check if this parent has active slide info
            if (window.__activeSlides && window.__activeSlides[parentId] === instanceIndex) {
              return true;
            }
          }
        }
      }
      
      // For non-repeating elements, check if they're in a slide that's active
      // by looking at the global active slides tracker
      if (window.__activeSlideElements) {
        // Check each slider to see if this element is in its active slide
        for (const [sliderId, activeIndex] of Object.entries(window.__activeSlideElements)) {
          // This is a simplified check - in practice we'd need to traverse the tree
          // For now, just use the passed isActiveSlide prop
          return isActiveSlide;
        }
      }
      
      return isActiveSlide;
    };
    
    // Apply active styles if this element is in the active slide OR active tab
    const effectiveIsActiveSlide = checkIfInActiveSlide();
    const shouldApplyActiveStyles = (effectiveIsActiveSlide || isActiveTab) && isExecuteMode;
    
    // 🔥 ENHANCED DEBUG LOGGING FOR TABS
    console.log('🔥 CONTAINER ACTIVE STYLING DEBUG:', {
      elementId: element.id,
      elementType: element.type,
      containerType: element.containerType,
      contentType: element.contentType,
      isExecuteMode,
      isActiveSlide: effectiveIsActiveSlide,
      isActiveTab: isActiveTab,
      shouldApplyActiveStyles,
      hasActiveBackgroundColor: !!props.activeBackgroundColor,
      currentBackgroundColor: props.backgroundColor,
      activeBackgroundColor: props.activeBackgroundColor
    });
    
    if (shouldApplyActiveStyles) {
      console.log('✅ Applying active styles for container:', element.id, {
        isActiveSlide: effectiveIsActiveSlide,
        isActiveTab: isActiveTab,
        reason: effectiveIsActiveSlide ? 'active slide' : 'active tab'
      });
      // Merge active properties over default properties
      const activeProps = {};
      Object.keys(props).forEach(key => {
        const activeKey = `active${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (props[activeKey] !== undefined) {
          activeProps[key] = props[activeKey];
        }
      });
      console.log('🎨 Active props to apply:', activeProps);
      props = { ...props, ...activeProps };
      console.log('🎨 Final props after active merge:', props);
    } else {
      console.log('❌ NOT applying active styles:', {
        isActiveSlide: effectiveIsActiveSlide,
        isActiveTab: isActiveTab,
        isExecuteMode,
        reason: !shouldApplyActiveStyles ? 'not active slide or tab' : 'not execute mode'
      });
    }
    
    console.log('🎨 Rendering container with props:', props);
    
    // Build styles from properties
    const containerStyle = {
      // Layout
      width: props.width || 'auto',
      height: props.height || 'auto',
      display: 'flex',
      flexDirection: props.orientation || 'column',
      alignItems: props.horizontalAlignment || 'flex-start',
      justifyContent: props.verticalAlignment || 'flex-start',
      
      // Styling - FIXED: Ensure background color is applied
      backgroundColor: props.backgroundColor || '#ffffff',
      
      // Spacing
      marginTop: `${props.marginTop || 0}px`,
      marginBottom: `${props.marginBottom || 0}px`,
      marginLeft: `${props.marginLeft || 0}px`,
      marginRight: `${props.marginRight || 0}px`,
      paddingTop: `${props.paddingTop || 15}px`,
      paddingBottom: `${props.paddingBottom || 15}px`,
      paddingLeft: `${props.paddingLeft || 15}px`,
      paddingRight: `${props.paddingRight || 15}px`,
      
      // Border Radius
      borderTopLeftRadius: `${props.borderRadiusTopLeft || 0}px`,
      borderTopRightRadius: `${props.borderRadiusTopRight || 0}px`,
      borderBottomLeftRadius: `${props.borderRadiusBottomLeft || 0}px`,
      borderBottomRightRadius: `${props.borderRadiusBottomRight || 0}px`,
      
      // Border
      borderTopWidth: `${props.borderTopWidth || 1}px`,
      borderBottomWidth: `${props.borderBottomWidth || 1}px`,
      borderLeftWidth: `${props.borderLeftWidth || 1}px`,
      borderRightWidth: `${props.borderRightWidth || 1}px`,
      borderTopStyle: props.borderTopStyle || 'dashed',
      borderBottomStyle: props.borderBottomStyle || 'dashed',
      borderLeftStyle: props.borderLeftStyle || 'dashed',
      borderRightStyle: props.borderRightStyle || 'dashed',
      borderTopColor: props.borderTopColor || '#ccc',
      borderBottomColor: props.borderBottomColor || '#ccc',
      borderLeftColor: props.borderLeftColor || '#ccc',
      borderRightColor: props.borderRightColor || '#ccc',
      
      // Shadow
      boxShadow: props.shadowBlur > 0 
        ? `${props.shadowX || 0}px ${props.shadowY || 0}px ${props.shadowBlur || 0}px ${props.shadowColor || '#000000'}`
        : 'none',
      
      // Canvas specific styles
      position: 'relative',
      cursor: 'grab',
      transition: 'all 0.2s ease',
      
      // Selection and drop zone styles
      ...(isSelected && {
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderRightStyle: 'solid',
        borderTopColor: '#007bff',
        borderBottomColor: '#007bff',
        borderLeftColor: '#007bff',
        borderRightColor: '#007bff',
        borderTopWidth: '2px',
        borderBottomWidth: '2px',
        borderLeftWidth: '2px',
        borderRightWidth: '2px'
      }),
      
      ...(isDropZone && {
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderRightStyle: 'solid',
        borderTopColor: '#0056b3',
        borderBottomColor: '#0056b3',
        borderLeftColor: '#0056b3',
        borderRightColor: '#0056b3',
        borderTopWidth: '2px',
        borderBottomWidth: '2px',
        borderLeftWidth: '2px',
        borderRightWidth: '2px',
        backgroundColor: '#e3f2fd'
      })
    };

    // Determine container label based on content type and container type
    const getContainerLabel = () => {
      const containerType = element.containerType || 'basic';
      let label = '';
      
      // Add container type prefix
      if (containerType === 'slider') {
        label = 'Slider Container';
      } else if (containerType === 'tabs') {
        label = 'Tabs Container';
      } else {
        label = 'Container';
      }
      
      // Add content type suffix
      if (contentType === 'repeating') {
        const config = element.repeatingConfig;
        if (config && config.databaseId && config.tableId) {
          label += ' (Repeating)';
        } else {
          label += ' (Repeating - No Data)';
        }
      } else {
        label += ` (${props.orientation || 'column'})`;
      }
      
      return label;
    };
    
    // Helper function to find tab index by value for tabs containers
    const findTabIndexByValue = (value, children) => {
      if (!value || !children) return -1;
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child || !child.props || !child.props.element) continue;
        
        // Recursively search for text element with matching value
        const findTabValue = (element) => {
          if (element.type === 'text' && element.properties?.isTabValue === true) {
            return element.properties?.value || '';
          }
          
          if (element.children) {
            for (const childEl of element.children) {
              const result = findTabValue(childEl);
              if (result) return result;
            }
          }
          
          return null;
        };
        
        const tabValue = findTabValue(child.props.element);
        if (tabValue === value) {
          return i;
        }
      }
      
      return -1;
    };
    
    // Get initial active tab for tabs containers
    const getInitialActiveTab = (tabsConfig, children) => {
      const activeTab = tabsConfig.activeTab || '1';
      
      // Try to parse as number first
      const tabNumber = parseInt(activeTab);
      if (!isNaN(tabNumber) && tabNumber > 0) {
        return Math.min(tabNumber - 1, (children?.length || 1) - 1);
      }
      
      // Otherwise, try to find by text value
      const tabIndex = findTabIndexByValue(activeTab, children);
      return tabIndex >= 0 ? tabIndex : 0;
    };
    
    // Check if this container is a slider container
    const isSliderContainer = (element.containerType || 'basic') === 'slider';
    
    // Check if this container is a tabs container
    const isTabsContainer = (element.containerType || 'basic') === 'tabs';
    
    // Get slider configuration - FIXED: Don't override existing config
    const sliderConfig = element.sliderConfig ? {
      autoPlay: element.sliderConfig.autoPlay || false,
      loop: element.sliderConfig.loop || false,
      slidesToScroll: element.sliderConfig.slidesToScroll || 1,
      activeTab: element.sliderConfig.activeTab || '1'
    } : {
      autoPlay: false,
      loop: false,
      slidesToScroll: 1,
      activeTab: '1'
    };
    
    // Get tabs configuration
    const tabsConfig = element.tabsConfig ? {
      activeTab: element.tabsConfig.activeTab || '1'
    } : {
      activeTab: '1'
    };
    
    // Debug logging for slider config
    if (isSliderContainer) {
      console.log('🎡 Slider container config for element:', element.id);
      console.log('🎡 sliderConfig:', sliderConfig);
      console.log('🎡 slidesToScroll:', sliderConfig.slidesToScroll);
    }
    
    // Debug logging for tabs config
    if (isTabsContainer) {
      console.log('📑 Tabs container config for element:', element.id);
      console.log('📑 tabsConfig:', tabsConfig);
      console.log('📑 activeTab:', tabsConfig.activeTab);
    }
    
    // Store active slide state in a context-like way
    const SlideContext = React.createContext(false);
    
    // Slider component for execute mode
    const SliderComponent = ({ children, sliderConfig, containerStyle, props, element }) => {
      // Helper function to find slide index by value
      const findSlideIndexByValue = (value) => {
        if (!value || !children) return -1;
        
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child || !child.props || !child.props.element) continue;
          
          // Recursively search for text element with matching value
          const findTextValue = (element) => {
            if (element.type === 'text' && element.properties?.isSlideText === true) {
              return element.properties?.value || '';
            }
            
            if (element.children) {
              for (const childEl of element.children) {
                const result = findTextValue(childEl);
                if (result) return result;
              }
            }
            
            return null;
          };
          
          const slideValue = findTextValue(child.props.element);
          if (slideValue === value) {
            return i;
          }
        }
        
        return -1;
      };
      
      // Initialize current slide based on activeTab (could be number or text value)
      const getInitialSlide = () => {
        const activeTab = sliderConfig.activeTab || '1';
        
        // Try to parse as number first
        const slideNumber = parseInt(activeTab);
        if (!isNaN(slideNumber) && slideNumber > 0) {
          return Math.min(slideNumber - 1, (children?.length || 1) - 1);
        }
        
        // Otherwise, try to find by text value
        const slideIndex = findSlideIndexByValue(activeTab);
        return slideIndex >= 0 ? slideIndex : 0;
      };
      
      const [currentSlide, setCurrentSlide] = useState(getInitialSlide());
      const [isTransitioning, setIsTransitioning] = useState(false);
      const sliderRef = useRef(null);
      const autoPlayRef = useRef(null);
      const isVertical = props.orientation === 'column';
      
      // Drag functionality state
      const [isDragging, setIsDragging] = useState(false);
      const [dragStart, setDragStart] = useState(null);
      const [dragOffset, setDragOffset] = useState(0);
      const [startTransform, setStartTransform] = useState(0);
      const dragOffsetRef = useRef(0);
      
      // Auto-play functionality
      useEffect(() => {
        if (sliderConfig.autoPlay && children && children.length > 1) {
          autoPlayRef.current = setInterval(() => {
            const slidesToScroll = sliderConfig.slidesToScroll || 1;
            goToSlide((currentSlide + slidesToScroll) % children.length);
          }, 3000); // 3 second intervals
        }
        
        return () => {
          if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
          }
        };
      }, [currentSlide, sliderConfig.autoPlay, sliderConfig.slidesToScroll, children]);
      
      // Store active slide info globally for elements to check
      useEffect(() => {
        if (element && element.id) {
          window.__activeSlides = window.__activeSlides || {};
          window.__activeSlides[element.id] = currentSlide;
        }
      }, [currentSlide, element]);
      
      const goToSlide = (slideIndex) => {
        if (isTransitioning || !children || slideIndex < 0 || slideIndex >= children.length) return;
        
        // Handle looping
        let targetSlide = slideIndex;
        if (!sliderConfig.loop) {
          targetSlide = Math.max(0, Math.min(slideIndex, children.length - 1));
        } else if (slideIndex >= children.length) {
          targetSlide = 0;
        } else if (slideIndex < 0) {
          targetSlide = children.length - 1;
        }
        
        setIsTransitioning(true);
        setCurrentSlide(targetSlide);
        
        // Update the element's sliderConfig to reflect the current slide
        if (element && element.sliderConfig) {
          element.sliderConfig.activeTab = String(targetSlide + 1); // Convert to 1-based string
          
          // Store active slide globally
          window.__activeSlides = window.__activeSlides || {};
          window.__activeSlides[element.id] = targetSlide;
          
          // Trigger a refresh by clicking the refresh button if it exists
          // This is a workaround to trigger recalculation
          setTimeout(() => {
            // Find all buttons and look for the refresh button
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
              const buttonText = button.textContent || '';
              // Look for refresh button by its text content
              if (buttonText.includes('Refresh') || buttonText.includes('🔄')) {
                button.click();
                break;
              }
            }
          }, 350); // Wait for slide transition to complete
        }
        
        // Reset transition state after animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      };
      
      const handleKeyDown = (e) => {
        const slidesToScroll = sliderConfig.slidesToScroll || 1;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          goToSlide(currentSlide - slidesToScroll);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          goToSlide(currentSlide + slidesToScroll);
        }
      };
      
      // Mouse drag functionality
      const onMouseDown = (e) => {
        setIsDragging(true);
        setDragStart(isVertical ? e.clientY : e.clientX);
        setStartTransform(currentSlide * (100 / children.length));
        setDragOffset(0);
        e.preventDefault();
      };
      
      const onMouseMove = (e) => {
        if (!isDragging || dragStart === null) return;
        
        const containerSize = isVertical 
          ? (sliderRef.current?.offsetHeight || 400)
          : (sliderRef.current?.offsetWidth || 800);
        
        const delta = isVertical
          ? (e.clientY - dragStart)
          : (e.clientX - dragStart);
        
        const dragPercentage = (delta / containerSize) * 100;
        
        // Calculate new offset with bounds
        let newOffset = dragPercentage;
        const maxOffset = (children.length - 1) * (100 / children.length);
        
        // Prevent dragging beyond bounds with resistance
        const currentPos = startTransform - (dragPercentage / children.length);
        if (currentPos < 0) {
          newOffset = dragPercentage * 0.3; // Add resistance
        } else if (currentPos > maxOffset) {
          newOffset = dragPercentage * 0.3; // Add resistance
        }
        
        setDragOffset(newOffset);
        dragOffsetRef.current = newOffset;
      };
      
      const onMouseUp = () => {
        if (!isDragging) return;
        
        const finalDragOffset = dragOffsetRef.current;
        
        setIsDragging(false);
        setDragOffset(0);
        dragOffsetRef.current = 0;
        
        // Calculate which slide to snap to
        const slideWidth = 100 / children.length;
        
        // Find nearest slide position with 20% threshold
        const dragThreshold = 0.2; // 20% threshold
        const dragDirection = finalDragOffset > 0 ? -1 : 1;
        
        // Calculate if we've dragged past the threshold
        const draggedPercentage = Math.abs(finalDragOffset) / slideWidth;
        const shouldChangeSlide = draggedPercentage > dragThreshold;
        
        let targetSlide;
        if (shouldChangeSlide) {
          targetSlide = currentSlide + dragDirection;
        } else {
          targetSlide = currentSlide;
        }
        
        const boundedSlide = Math.max(0, Math.min(targetSlide, children.length - 1));
        goToSlide(boundedSlide);
      };
      
      // Add global mouse events
      useEffect(() => {
        const handleGlobalMouseMove = (e) => onMouseMove(e);
        const handleGlobalMouseUp = () => onMouseUp();
        
        if (isDragging) {
          document.addEventListener('mousemove', handleGlobalMouseMove);
          document.addEventListener('mouseup', handleGlobalMouseUp);
        }
        
        return () => {
          document.removeEventListener('mousemove', handleGlobalMouseMove);
          document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
      }, [isDragging, dragStart, startTransform]);
      
      // Touch/swipe support with improved detection
      const [touchStart, setTouchStart] = useState(null);
      const [touchEnd, setTouchEnd] = useState(null);
      
      const onTouchStart = (e) => {
        setTouchEnd(null);
        setIsDragging(false);
        const touch = e.targetTouches[0];
        setTouchStart({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
      };
      
      const onTouchMove = (e) => {
        if (!touchStart) return;
        
        const touch = e.targetTouches[0];
        setTouchEnd({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
        
        // Prevent default scrolling if we're swiping horizontally
        const deltaX = Math.abs(touch.clientX - touchStart.x);
        const deltaY = Math.abs(touch.clientY - touchStart.y);
        
        if (props.orientation === 'row' && deltaX > deltaY && deltaX > 10) {
          e.preventDefault();
          setIsDragging(true);
        } else if (props.orientation === 'column' && deltaY > deltaX && deltaY > 10) {
          e.preventDefault();
          setIsDragging(true);
        }
      };
      
      const onTouchEnd = () => {
        if (!touchStart || !touchEnd || !isDragging) {
          setTouchStart(null);
          setTouchEnd(null);
          setIsDragging(false);
          return;
        }
        
        const deltaX = touchStart.x - touchEnd.x;
        const deltaY = touchStart.y - touchEnd.y;
        const deltaTime = touchEnd.time - touchStart.time;
        
        // Minimum swipe distance and maximum time for swipe detection
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;
        
        if (deltaTime > maxSwipeTime) {
          setTouchStart(null);
          setTouchEnd(null);
          setIsDragging(false);
          return;
        }
        
        const slidesToScroll = sliderConfig.slidesToScroll || 1;
        if (props.orientation === 'row') {
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX > minSwipeDistance) {
            if (deltaX > 0) {
              // Swiped left - go to next slide
              goToSlide(currentSlide + slidesToScroll);
            } else {
              // Swiped right - go to previous slide
              goToSlide(currentSlide - slidesToScroll);
            }
          }
        } else {
          const absDeltaY = Math.abs(deltaY);
          if (absDeltaY > minSwipeDistance) {
            if (deltaY > 0) {
              // Swiped up - go to next slide
              goToSlide(currentSlide + slidesToScroll);
            } else {
              // Swiped down - go to previous slide
              goToSlide(currentSlide - slidesToScroll);
            }
          }
        }
        
        setTouchStart(null);
        setTouchEnd(null);
        setIsDragging(false);
      };
      
      const getTransformValue = () => {
        const slidePercentage = currentSlide * (100 / children.length);
        const offsetPercentage = isDragging ? (dragOffset / children.length) : 0;
        const totalPercentage = slidePercentage - offsetPercentage;
        
        if (props.orientation === 'row') {
          return `translateX(-${totalPercentage}%)`;
        } else {
          return `translateY(-${totalPercentage}%)`;
        }
      };
      
      return (
        <div
          style={{
            ...containerStyle,
            outline: 'none'
          }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          ref={sliderRef}
        >
          {/* Content Area with Slider */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: props.orientation || 'column',
            alignItems: props.horizontalAlignment || 'flex-start',
            justifyContent: props.verticalAlignment || 'flex-start',
            marginTop: isExecuteMode ? '0px' : '20px',
            gap: '0px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div 
              style={{
                display: 'flex',
                flexDirection: props.orientation === 'row' ? 'row' : 'column',
                width: props.orientation === 'row' ? `${children.length * 100}%` : '100%',
                height: props.orientation === 'column' ? `${children.length * 100}%` : '100%',
                transition: (isTransitioning && !isDragging) ? 'transform 0.3s ease-in-out' : 'none',
                transform: getTransformValue(),
                willChange: 'transform',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {children.map((child, index) => {
                // Check if this slide is active
                const isActive = index === currentSlide;
                
                return (
                  <div
                    key={child.key || index}
                    className={isActive ? 'active-slide' : 'inactive-slide'}
                    style={{
                      flex: '0 0 auto',
                      width: props.orientation === 'row' ? `${100 / children.length}%` : '100%',
                      height: props.orientation === 'column' ? `${100 / children.length}%` : '100%',
                      display: 'flex',
                      flexDirection: props.orientation === 'row' ? 'row' : 'column',
                      alignItems: 'stretch',
                      justifyContent: 'flex-start',
                      overflow: 'hidden',
                      gap: 0
                    }}
                    data-is-active-slide={isActive}
                  >
                    {/* Clone child with isActiveSlide prop if it's the active slide */}
                    {React.isValidElement(child) && isActive ? 
                      React.cloneElement(child, { 
                        ...child.props,
                        isActiveSlide: true,
                        'data-active-slide': 'true'
                      }) : child}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Navigation Controls */}
          {children && children.length > 1 && (
            <>
              {/* Previous/Next buttons */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const slidesToScroll = sliderConfig.slidesToScroll || 1;
                  goToSlide(currentSlide - slidesToScroll);
                }}
                disabled={!sliderConfig.loop && currentSlide === 0}
                style={{
                  position: 'absolute',
                  top: isVertical ? '10px' : '50%',
                  left: isVertical ? '50%' : '10px',
                  transform: isVertical ? 'translateX(-50%)' : 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: (!sliderConfig.loop && currentSlide === 0) ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  pointerEvents: 'auto'
                }}
              >
                {isVertical ? '▲' : '‹'}
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const slidesToScroll = sliderConfig.slidesToScroll || 1;
                  goToSlide(currentSlide + slidesToScroll);
                }}
                disabled={!sliderConfig.loop && currentSlide === children.length - 1}
                style={{
                  position: 'absolute',
                  bottom: isVertical ? '10px' : 'auto',
                  top: isVertical ? 'auto' : '50%',
                  right: isVertical ? 'auto' : '10px',
                  left: isVertical ? '50%' : 'auto',
                  transform: isVertical ? 'translateX(-50%)' : 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: (!sliderConfig.loop && currentSlide === children.length - 1) ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  pointerEvents: 'auto'
                }}
              >
                {isVertical ? '▼' : '›'}
              </button>
              
              {/* Dots navigation */}
              <div style={{
                position: 'absolute',
                bottom: isVertical ? 'auto' : '15px',
                left: isVertical ? 'auto' : '50%',
                right: isVertical ? '15px' : 'auto',
                top: isVertical ? '50%' : 'auto',
                transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)',
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                gap: '8px',
                zIndex: 3
              }}>
                {children.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Dot clicked:', index);
                      goToSlide(index);
                    }}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: index === currentSlide ? '#8b5cf6' : 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      zIndex: 999,
                      pointerEvents: 'auto'
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      );
    };
    
    // Handle tabs container in execute mode - elements are clickable tabs
    if (isExecuteMode && isTabsContainer && children && children.length > 0) {
      // FIXED: Check if we already have an active tab stored globally, otherwise use initial
      let currentActiveTab;
      if (element && element.id && window.__activeTabs && window.__activeTabs[element.id] !== undefined) {
        // Use the stored active tab
        currentActiveTab = window.__activeTabs[element.id];
        console.log('🔥 USING STORED ACTIVE TAB:', currentActiveTab);
      } else {
        // Use initial active tab from config
        currentActiveTab = getInitialActiveTab(tabsConfig, children);
        console.log('🔥 USING INITIAL ACTIVE TAB:', currentActiveTab);
        
        // Store it globally
        if (element && element.id) {
          window.__activeTabs = window.__activeTabs || {};
          window.__activeTabs[element.id] = currentActiveTab;
        }
      }
      
      // Create click handler for tab activation
      const handleTabClick = (tabIndex) => {
        console.log('🔥 TAB CLICK DEBUG:', {
          tabIndex,
          elementId: element.id,
          currentTabsConfig: element.tabsConfig,
          totalChildren: children?.length
        });
        
        // Initialize tabsConfig if it doesn't exist
        if (!element.tabsConfig) {
          element.tabsConfig = {
            activeTab: '1'
          };
          console.log('🔥 INITIALIZED MISSING tabsConfig:', element.tabsConfig);
        }
        
        if (element && element.tabsConfig) {
          element.tabsConfig.activeTab = String(tabIndex + 1); // Convert to 1-based string
          
          // Store active tab globally
          window.__activeTabs = window.__activeTabs || {};
          window.__activeTabs[element.id] = tabIndex;
          
          console.log('🔥 TAB STATE UPDATED:', {
            newActiveTab: element.tabsConfig.activeTab,
            globalTabsState: window.__activeTabs
          });
          
          // Trigger a refresh to update active states
          setTimeout(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
              const buttonText = button.textContent || '';
              if (buttonText.includes('Refresh') || buttonText.includes('🔄')) {
                console.log('🔥 TRIGGERING REFRESH BUTTON');
                button.click();
                break;
              }
            }
          }, 50);
        }
      };
      
      // Render all children with click handlers and active state
      return (
        <div
          key={element.id}
          style={{
            ...containerStyle,
            cursor: 'default'
          }}
        >
          {/* Container Label - Hide in execute mode */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: props.orientation || 'column',
            alignItems: props.horizontalAlignment || 'flex-start',
            justifyContent: props.verticalAlignment || 'flex-start',
            gap: props.orientation === 'row' ? '10px' : '5px'
          }}>
            {children.map((child, index) => {
              const isActiveTab = index === currentActiveTab;
              
              // Clone child with click handler and active state
              if (React.isValidElement(child)) {
                // Get the element definition to call its render function with isActiveTab
                const elementDef = getElementByType(child.props.element?.type);
                if (elementDef && elementDef.render) {
                  // Re-render the child element with isActiveTab prop
                  return React.cloneElement(
                    elementDef.render(
                      child.props.element,
                      depth + 1,
                      false, // not selected
                      false, // not drop zone
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          handleTabClick(index);
                        }
                      },
                      child.props.children,
                      null, // matchedConditionIndex
                      true, // isExecuteMode
                      false, // isActiveSlide
                      isActiveTab // isActiveTab
                    ),
                    {
                      key: child.key || index,
                      'data-active-tab': isActiveTab ? 'true' : 'false',
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  );
                } else {
                  // Fallback to simple cloning
                  return React.cloneElement(child, {
                    ...child.props,
                    key: child.key || index,
                    isActiveTab: isActiveTab,
                    'data-active-tab': isActiveTab ? 'true' : 'false',
                    onClick: (e) => {
                      e.stopPropagation();
                      handleTabClick(index);
                    },
                    style: {
                      ...child.props.style,
                      cursor: 'pointer'
                    }
                  });
                }
              }
              return child;
            })}
          </div>
        </div>
      );
    }
    
    // Render slider component in execute mode, regular container otherwise
    if (isExecuteMode && isSliderContainer && children && children.length > 0) {
      // For sliders in execute mode, just use the children as-is (preserves repeating containers)
      // The active slide state will be handled by storing it globally
      return (
        <SliderComponent 
          children={children}
          sliderConfig={sliderConfig}
          containerStyle={containerStyle}
          props={props}
          element={element}
        />
      );
    }
    
    return (
      <div
        key={element.id}
        draggable={!isExecuteMode}
        onClick={(e) => {
          if (!isExecuteMode) {
            onClick && onClick(element, e);
          }
        }}
        onDragStart={(e) => {
          if (!isExecuteMode) {
            e.stopPropagation();
            onDragStart && onDragStart(e);
          }
        }}
        onDragOver={(e) => {
          if (!isExecuteMode) {
            e.stopPropagation();
            onDragOver && onDragOver(e);
          }
        }}
        onDragLeave={(e) => {
          if (!isExecuteMode) {
            e.stopPropagation();
            onDragLeave && onDragLeave(e);
          }
        }}
        onDrop={(e) => {
          if (!isExecuteMode) {
            e.stopPropagation();
            onDrop && onDrop(e);
          }
        }}
        style={{
          ...containerStyle,
          cursor: isExecuteMode ? 'default' : containerStyle.cursor
        }}
        onMouseDown={(e) => {
          if (!isExecuteMode) {
            e.currentTarget.style.cursor = 'grabbing';
          }
        }}
        onMouseUp={(e) => {
          if (!isExecuteMode) {
            e.currentTarget.style.cursor = 'grab';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExecuteMode) {
            e.currentTarget.style.cursor = 'grab';
          }
        }}
      >
        {/* Container Label - Hide in execute mode */}
        {!isExecuteMode && (
          <div 
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              fontSize: '10px',
              color: isSliderContainer ? '#8b5cf6' : (contentType === 'repeating' ? '#28a745' : '#666'),
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: `1px solid ${isSliderContainer ? '#8b5cf6' : (contentType === 'repeating' ? '#28a745' : '#ddd')}`,
              zIndex: 1,
              pointerEvents: 'none',
              fontWeight: (isSliderContainer || contentType === 'repeating') ? 'bold' : 'normal'
            }}
          >
            {getContainerLabel()}
            {element.renderType === 'conditional' && (
              <span style={{ color: '#007bff', marginLeft: '4px' }}>• Conditional</span>
            )}
          </div>
        )}
        
        {/* Delete Button - Hide in execute mode */}
        {!isExecuteMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(element.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              fontSize: '12px',
              borderRadius: '50%',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        )}

        {/* Drag Handle - Hide in execute mode */}
        {!isExecuteMode && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: '#999',
              cursor: 'grab',
              padding: '2px 4px',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            ⋮⋮
          </div>
        )}

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: props.orientation || 'column',
          alignItems: props.horizontalAlignment || 'flex-start',
          justifyContent: props.verticalAlignment || 'flex-start',
          marginTop: isExecuteMode ? '0px' : '20px',
          gap: props.orientation === 'row' ? '10px' : '5px',
          // Slider-specific styles
          ...(isSliderContainer && {
            overflow: 'hidden',
            position: 'relative'
          })
        }}>
          {children && children.length > 0 ? (
            isSliderContainer && !isExecuteMode ? (
              // Slider wrapper for slides (builder mode)
              <div style={{
                display: 'flex',
                flexDirection: props.orientation === 'row' ? 'row' : 'column',
                width: props.orientation === 'row' ? `${children.length * 100}%` : '100%',
                height: props.orientation === 'column' ? `${children.length * 100}%` : '100%',
                transition: 'transform 0.3s ease-in-out',
                transform: props.orientation === 'row' 
                  ? `translateX(-${(parseInt(sliderConfig.activeTab) - 1) * (100 / children.length)}%)`
                  : `translateY(-${(parseInt(sliderConfig.activeTab) - 1) * (100 / children.length)}%)`
              }}>
                {children.map((child, index) => (
                  <div
                    key={child.key || index}
                    style={{
                      flex: '0 0 auto',
                      width: props.orientation === 'row' ? `${100 / children.length}%` : '100%',
                      height: props.orientation === 'column' ? `${100 / children.length}%` : '100%',
                      display: 'flex',
                      flexDirection: props.orientation === 'row' ? 'row' : 'column',
                      alignItems: 'stretch',
                      justifyContent: 'flex-start',
                      overflow: 'hidden',
                      gap: 0
                    }}
                  >
                    {child}
                  </div>
                ))}
              </div>
            ) : (
              !isSliderContainer && children
            )
          ) : (
            !isExecuteMode && (
              <div 
                onDragOver={(e) => {
                  e.stopPropagation();
                  onDragOver && onDragOver(e);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  onDrop && onDrop(e);
                }}
                style={{ 
                  color: isDropZone ? '#0056b3' : '#999', 
                  fontSize: '12px', 
                  textAlign: 'center',
                  alignSelf: 'center',
                  margin: 'auto',
                  padding: '20px',
                  border: isDropZone 
                    ? '2px dashed #0056b3' 
                    : '2px dashed #ddd',
                  borderRadius: '4px',
                  backgroundColor: isDropZone ? '#ffffff' : 'transparent',
                  fontWeight: isDropZone ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isDropZone ? 'Release to drop here' : (isSliderContainer ? 'Drop slide elements here' : 'Drop elements here')}
              </div>
            )
          )}
        </div>
        
        {/* Slider Navigation Controls (only show in builder mode) */}
        {!isExecuteMode && isSliderContainer && children && children.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            zIndex: 2
          }}>
            {children.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: index === (parseInt(sliderConfig.activeTab) - 1) ? '#8b5cf6' : '#ccc',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // This would be handled by parent component in execute mode
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  },

  // Use the properties panel
  PropertiesPanel: ContainerPropertiesPanel
};
