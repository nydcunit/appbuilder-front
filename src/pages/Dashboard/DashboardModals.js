import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ============================================
// CREATE APP WIZARD MODAL
// ============================================

export const CreateAppWizardModal = ({ isOpen, onClose, onAppCreated }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [appData, setAppData] = useState({
    name: '',
    subdomain: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  const handleInputChange = (field, value) => {
    setAppData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate subdomain from name
    if (field === 'name') {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setAppData(prev => ({
        ...prev,
        subdomain
      }));
      setSubdomainAvailable(null);
    }
  };

  const checkSubdomainAvailability = async () => {
    if (!appData.subdomain) return;

    // DISABLED: Skip subdomain validation - manually ensure subdomain is available
    setSubdomainAvailable(true);
    
    // Original validation code (commented out):
    // setCheckingSubdomain(true);
    // try {
    //   const response = await axios.get(`/api/apps/check-subdomain/${appData.subdomain}`);
    //   setSubdomainAvailable(response.data.available);
    // } catch (error) {
    //   console.error('Error checking subdomain:', error);
    //   setSubdomainAvailable(false);
    // } finally {
    //   setCheckingSubdomain(false);
    // }
  };

  const handleNext = () => {
    if (step === 1 && appData.name) {
      setStep(2);
    } else if (step === 2 && appData.subdomain && subdomainAvailable) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/apps', appData);
      if (response.data.success) {
        onAppCreated(response.data.data);
        // Navigate to the builder
        navigate(`/builder/${response.data.data._id}`);
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create app');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setAppData({
      name: '',
      subdomain: '',
      description: ''
    });
    setError('');
    setSubdomainAvailable(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= num ? '#007bff' : '#e0e0e0',
                color: step >= num ? 'white' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                margin: '0 8px',
                transition: 'all 0.3s ease'
              }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
              Name Your App
            </h2>
            <input
              type="text"
              placeholder="Enter app name"
              value={appData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              autoFocus
            />
            <p style={{
              marginTop: '8px',
              fontSize: '14px',
              color: '#666'
            }}>
              Choose a memorable name for your application
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
              Choose Your Subdomain
            </h2>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="your-app-name"
                value={appData.subdomain}
                onChange={(e) => {
                  handleInputChange('subdomain', e.target.value);
                  setSubdomainAvailable(null);
                }}
                onBlur={checkSubdomainAvailability}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: `2px solid ${
                    subdomainAvailable === false ? '#dc3545' : 
                    subdomainAvailable === true ? '#28a745' : 
                    '#e0e0e0'
                  }`,
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                autoFocus
              />
              {checkingSubdomain && (
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666'
                }}>
                  Checking...
                </div>
              )}
            </div>
            <p style={{
              marginTop: '8px',
              fontSize: '14px',
              color: '#666'
            }}>
              Your app will be available at {appData.subdomain || 'your-subdomain'}.localhost:3001
              <br />
              <span style={{ fontSize: '12px', color: '#28a745' }}>
                ✓ Subdomain validation disabled - manually ensure subdomain is available
              </span>
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
              Add a Description
            </h2>
            <textarea
              placeholder="What will your app do? (optional)"
              value={appData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                minHeight: '120px',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              autoFocus
            />
            <p style={{
              marginTop: '8px',
              fontSize: '14px',
              color: '#666'
            }}>
              Help yourself remember what this app is for
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '6px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '32px'
        }}>
          <button
            onClick={step === 1 ? handleClose : handleBack}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !appData.name) ||
                (step === 2 && (!appData.subdomain || !subdomainAvailable))
              }
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                opacity: (
                  (step === 1 && !appData.name) ||
                  (step === 2 && (!appData.subdomain || !subdomainAvailable))
                ) ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Creating...' : 'Create App'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// APP SETTINGS MODAL
// ============================================

export const AppSettingsModal = ({ isOpen, onClose, app, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: app?.name || '',
    subdomain: app?.subdomain || '',
    description: app?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Update form data when app prop changes
  React.useEffect(() => {
    if (app) {
      setFormData({
        name: app.name || '',
        subdomain: app.subdomain || '',
        description: app.description || ''
      });
    }
  }, [app]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!app?._id) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.put(`/api/apps/${app._id}`, formData);
      if (response.data.success) {
        setSuccess(true);
        onUpdate(response.data.data);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update app settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!app?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${app.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(`/api/apps/${app._id}`);
      if (response.data.success) {
        onUpdate(null); // Signal that app was deleted
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete app');
      setLoading(false);
    }
  };

  if (!isOpen || !app) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '24px' }}>App Settings</h2>

        {/* App Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}>
            App Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              outline: 'none'
            }}
          />
        </div>

        {/* Subdomain */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}>
            Subdomain
          </label>
          <input
            type="text"
            value={formData.subdomain}
            onChange={(e) => handleInputChange('subdomain', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              outline: 'none'
            }}
          />
          <p style={{
            marginTop: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            Your app URL: {formData.subdomain || 'subdomain'}.localhost:3001
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              outline: 'none',
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="What does this app do?"
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '10px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '16px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            color: '#2e7d32',
            fontSize: '14px'
          }}>
            Settings saved successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '24px'
        }}>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#dc3545',
              color: 'white',
              cursor: 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Delete App
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#666',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.name || !formData.subdomain}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                opacity: (loading || !formData.name || !formData.subdomain) ? 0.5 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
