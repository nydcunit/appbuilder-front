import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppSettingsModal = ({ isOpen, onClose, app, onAppUpdated }) => {
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

  useEffect(() => {
    if (app && isOpen) {
      setFormData({
        name: app.name || '',
        description: app.description || '',
        appType: app.appType || 'web',
        subdomain: app.subdomain || '',
        icon: null,
        iconPreview: app.iconUrl || null
      });
    }
  }, [app, isOpen]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'App name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'App name cannot be more than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description cannot be more than 500 characters';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain letters, numbers, and hyphens';
    } else if (formData.subdomain.length < 3) {
      newErrors.subdomain = 'Subdomain must be at least 3 characters';
    } else if (formData.subdomain.length > 50) {
      newErrors.subdomain = 'Subdomain cannot be more than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        appType: formData.appType,
        subdomain: formData.subdomain
      };

      const response = await axios.put(`/api/apps/${app._id}`, updateData);
      
      if (response.data.success) {
        onAppUpdated(response.data.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error updating app:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error updating app. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            App Settings
          </h2>
          <p style={{ 
            color: '#666', 
            margin: 0,
            lineHeight: '1.5'
          }}>
            Update your application settings and configuration.
          </p>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '2rem',
          overflow: 'auto'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            {/* Icon Upload */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                App Icon
              </label>
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
                placeholder="Enter app name"
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                Description
              </label>
              <textarea
                placeholder="Enter app description"
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

            {/* App Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                App Type
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

            {/* Subdomain */}
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
                  placeholder="subdomain"
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

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handleClose}
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
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {isSubmitting ? 'Updating...' : 'Update App'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsModal;
