import React, { useState } from 'react';
import axios from 'axios';

const CreateAppWizardModal = ({ isOpen, onClose, onAppCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    appType: 'web',
    subdomain: '',
    icon: null,
    iconPreview: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleIconUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          icon: 'Please upload a PNG, JPG, or SVG file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          icon: 'File size must be less than 5MB'
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          icon: file,
          iconPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        icon: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'App name is required';
      } else if (formData.name.length > 100) {
        newErrors.name = 'App name cannot be more than 100 characters';
      }

      if (formData.description.length > 500) {
        newErrors.description = 'Description cannot be more than 500 characters';
      }
    }

    if (step === 2) {
      if (formData.appType === 'web') {
        if (!formData.subdomain.trim()) {
          newErrors.subdomain = 'Subdomain is required for web applications';
        } else if (!/^[a-zA-Z0-9-]+$/.test(formData.subdomain)) {
          newErrors.subdomain = 'Subdomain can only contain letters, numbers, and hyphens';
        } else if (formData.subdomain.length < 3) {
          newErrors.subdomain = 'Subdomain must be at least 3 characters';
        } else if (formData.subdomain.length > 50) {
          newErrors.subdomain = 'Subdomain cannot be more than 50 characters';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    try {
      // For now, we'll create the app with the existing API structure
      // In the future, you can extend the backend to handle the new fields
      const appData = {
        name: formData.name,
        description: formData.description,
        // These fields would need to be added to the backend model
        appType: formData.appType,
        subdomain: formData.appType === 'web' ? formData.subdomain : null
      };

      const response = await axios.post('/api/apps', appData);
      
      if (response.data.success) {
        onAppCreated(response.data.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating app:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error creating app. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      appType: 'web',
      subdomain: '',
      icon: null,
      iconPreview: null
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const renderStepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '2rem',
      gap: '1rem'
    }}>
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: currentStep >= step ? '#333' : '#e5e5e5',
              color: currentStep >= step ? 'white' : '#999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {step}
            </div>
            <span style={{
              color: currentStep >= step ? '#333' : '#999',
              fontWeight: currentStep === step ? '600' : '400',
              fontSize: '14px'
            }}>
              {step === 1 ? 'Information' : step === 2 ? 'Options' : 'Review'}
            </span>
          </div>
          {step < 3 && (
            <div style={{
              width: '40px',
              height: '2px',
              backgroundColor: currentStep > step ? '#333' : '#e5e5e5'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '0.5rem',
        color: '#333'
      }}>
        Create Application
      </h2>
      <p style={{ 
        color: '#666', 
        marginBottom: '2rem',
        lineHeight: '1.5'
      }}>
        Enter the required information below to create your new application. This will allow you to proceed to the next step.
      </p>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        {/* Icon Upload */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            width: '120px',
            height: '120px',
            backgroundColor: formData.iconPreview ? 'transparent' : '#e5e5e5',
            borderRadius: '12px',
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {formData.iconPreview ? (
              <img 
                src={formData.iconPreview} 
                alt="App icon preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px'
                }}
              />
            ) : (
              <span style={{ color: '#999', fontSize: '14px' }}>+ Upload</span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={handleIconUpload}
              style={{ display: 'none' }}
            />
          </label>
          {errors.icon && (
            <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '0.5rem' }}>
              {errors.icon}
            </p>
          )}
          <p style={{ color: '#666', fontSize: '12px', marginTop: '0.5rem' }}>
            PNG, JPG, or SVG (max 5MB)
          </p>
        </div>

        {/* App Name */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            App Name
          </label>
          <input
            type="text"
            placeholder="Enter name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.name ? '#dc3545' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = errors.name ? '#dc3545' : '#ddd'}
          />
          {errors.name && (
            <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '0.5rem' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label style={{
            display: 'block',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            Description
          </label>
          <textarea
            placeholder="Provide application description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.description ? '#dc3545' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = errors.description ? '#dc3545' : '#ddd'}
          />
          {errors.description && (
            <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '0.5rem' }}>
              {errors.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '0.5rem',
        color: '#333'
      }}>
        App Options
      </h2>
      <p style={{ 
        color: '#666', 
        marginBottom: '2rem',
        lineHeight: '1.5'
      }}>
        Enter the required information below to create your new application. This will allow you to proceed to the next step.
      </p>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        {/* App Type */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            Type
          </label>
          <select
            value={formData.appType}
            onChange={(e) => handleInputChange('appType', e.target.value)}
            style={{
              width: '200px',
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="web">Web Application</option>
            <option value="mobile">Mobile Application</option>
          </select>
        </div>

        {/* Subdomain (only for web apps) */}
        {formData.appType === 'web' && (
          <div>
            <label style={{
              display: 'block',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#333'
            }}>
              Subdomain
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${errors.subdomain ? '#dc3545' : '#ddd'}`,
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <input
                type="text"
                placeholder="Subdomain"
                value={formData.subdomain}
                onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <span style={{
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                color: '#666',
                fontSize: '16px',
                borderLeft: '1px solid #ddd'
              }}>
                .localhost:3000
              </span>
            </div>
            {errors.subdomain && (
              <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '0.5rem' }}>
                {errors.subdomain}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '0.5rem',
        color: '#333'
      }}>
        App Options
      </h2>
      <p style={{ 
        color: '#666', 
        marginBottom: '2rem',
        lineHeight: '1.5'
      }}>
        Review your application details.
      </p>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        {/* Review Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', color: '#333' }}>Project Name</span>
            <span style={{ color: '#666' }}>{formData.name}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: '500', color: '#333' }}>Project Description</span>
            <span style={{ color: '#666', textAlign: 'right', maxWidth: '300px' }}>
              {formData.description || 'No description provided'}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', color: '#333' }}>Type</span>
            <span style={{ color: '#666' }}>
              {formData.appType === 'web' ? 'Web' : 'Mobile'}
            </span>
          </div>
          
          {formData.appType === 'web' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Subdomain</span>
              <span style={{ color: '#666' }}>{formData.subdomain}.localhost:3000</span>
            </div>
          )}
        </div>
      </div>

      {errors.submit && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '14px'
        }}>
          {errors.submit}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem 2rem 0 2rem'
        }}>
          {renderStepIndicator()}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '0 2rem 2rem 2rem',
          overflow: 'auto'
        }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={currentStep === 1 ? handleClose : handlePrevious}
            style={{
              backgroundColor: '#f8f9fa',
              color: '#333',
              border: '1px solid #ddd',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#ccc' : '#333',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {isSubmitting ? 'Creating...' : currentStep === 3 ? 'Submit' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAppWizardModal;
