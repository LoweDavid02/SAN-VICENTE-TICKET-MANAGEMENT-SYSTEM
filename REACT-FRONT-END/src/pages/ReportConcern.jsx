/**
 * ReportConcern.jsx — Submit a Concern (Civic UI)
 * Single-page form with photo upload, geolocation, and validation
 * Material Design 3 success page with glass morphism
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../lib/axios';

const CATEGORIES = [
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Sanitation', label: 'Sanitation' },
  { value: 'Public Safety', label: 'Public Safety' },
  { value: 'Waste Management', label: 'Waste Management' },
  { value: 'Health & Medical', label: 'Health & Medical' },
  { value: 'Public Order', label: 'Public Order' },
  { value: 'Other', label: 'Other' },
];

const URGENCY_LEVELS = [
  { value: 'Low', label: 'Low', color: '#10B981' },
  { value: 'Medium', label: 'Medium', color: '#F59E0B' },
  { value: 'High', label: 'High', color: '#EF4444' },
];

export default function ReportConcern() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSuccessPage = location.pathname === '/report/success';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  // Get reference code directly from location.state (synchronous)
  // This ensures it's available immediately when the component renders
  const referenceCode = location.state?.referenceCode || null;

  // Debug logging
  useEffect(() => {
    console.log('=== ReportConcern Component Rendered ===');
    console.log('Current pathname:', location.pathname);
    console.log('Is success page:', isSuccessPage);
    console.log('Location state:', location.state);
    console.log('Reference code:', referenceCode);
  }, [location.pathname, location.state, isSuccessPage, referenceCode]);

  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_address: '',
    category: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    severity: 'Medium',
    photos: [],
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateField = (field, value) => {
    let error = null;

    switch (field) {
      case 'guest_name':
        if (!value || value.length < 3) error = 'Name must be at least 3 characters';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name can only contain letters and spaces';
        break;
      case 'guest_email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email address';
        break;
      case 'guest_phone':
        if (!value) error = 'Phone number is required';
        else if (!/^09\d{9}$/.test(value.replace(/[\s\-]/g, ''))) error = 'Must be PH format: 09XXXXXXXXX';
        break;
      case 'guest_address':
        if (!value || value.length < 5) error = 'Address must be at least 5 characters';
        break;
      case 'category':
        if (!value) error = 'Please select a category';
        break;
      case 'description':
        if (!value || value.length < 20) error = 'Description must be at least 20 characters';
        else if (value.length > 1000) error = 'Description cannot exceed 1000 characters';
        break;
      case 'location':
        if (!value || value.length < 5) error = 'Location must be at least 5 characters';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field) => {
    validateField(field, formData[field]);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateField('latitude', latitude);
        updateField('longitude', longitude);
        updateField('location', `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        setLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enter it manually.');
        setLocating(false);
      }
    );
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (formData.photos.length + files.length > 3) {
      setErrors(prev => ({ ...prev, photos: 'Maximum 3 photos allowed' }));
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of files) {
      // Check MIME type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, photos: 'Only JPEG, PNG, and WebP images allowed' }));
        continue;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photos: 'Each photo must be under 10MB' }));
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      updateField('photos', [...formData.photos, ...validFiles]);
      setErrors(prev => ({ ...prev, photos: null }));
    }
  };

  const removePhoto = (index) => {
    updateField('photos', formData.photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Submit button clicked - starting validation');

    // Check CAPTCHA first
    if (!captchaToken) {
      setErrors({ captcha: 'Please complete the reCAPTCHA verification' });
      // Scroll to CAPTCHA
      const captchaElement = document.querySelector('.recaptcha-container');
      if (captchaElement) {
        captchaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Validate all fields
    const fieldsToValidate = ['guest_name', 'guest_email', 'guest_phone', 'guest_address', 'category', 'description', 'location'];
    let isValid = true;

    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      console.log('Validation failed:', errors);
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log('Validation passed - submitting form');
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('guest_name', formData.guest_name);
      formDataToSend.append('guest_email', formData.guest_email);
      formDataToSend.append('guest_phone', formData.guest_phone.replace(/[\s\-]/g, ''));
      formDataToSend.append('guest_address', formData.guest_address);
      formDataToSend.append('title', formData.description.substring(0, 100)); // Use first 100 chars as title
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category.toLowerCase().replace(/\s+/g, '_'));
      formDataToSend.append('location', formData.location);
      formDataToSend.append('severity', formData.severity);
      
      // Add CAPTCHA token
      formDataToSend.append('captcha_token', captchaToken);
      
      // Add coordinates if available
      if (formData.latitude) {
        formDataToSend.append('latitude', formData.latitude);
      }
      if (formData.longitude) {
        formDataToSend.append('longitude', formData.longitude);
      }
      
      // Add photos
      formData.photos.forEach((photo, index) => {
        formDataToSend.append('photos[]', photo);
      });

      console.log('Sending request to API...');
      const response = await api.post(
        '/tickets',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('API response:', response.data);

      if (response.data.success) {
        // Navigate to success page with reference code
        console.log('Navigating to success page with tracking ID:', response.data.tracking_id);
        navigate('/report/success', {
          state: { referenceCode: response.data.tracking_id },
          replace: true,
        });
      } else {
        console.error('Submission failed:', response.data.message);
        setErrors({ submit: response.data.message || 'Failed to submit concern' });
        // Reset CAPTCHA on failure
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setCaptchaToken(null);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Reset CAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaToken(null);
      }
      
      if (error.response?.status === 422) {
        // Validation errors from server
        const serverErrors = error.response.data.errors || {};
        console.error('Server validation errors:', serverErrors);
        setErrors(serverErrors);
      } else if (error.response?.data?.message) {
        // Server returned a specific error message
        console.error('Server error message:', error.response.data.message);
        setErrors({ submit: error.response.data.message });
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        setErrors({ submit: 'Request timeout. The server took too long to respond. Please try again.' });
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        // Network error - backend not running
        setErrors({ submit: 'Cannot connect to server. Please ensure the backend is running.' });
      } else {
        console.error('Network or server error:', error.message);
        setErrors({ submit: `Failed to submit your concern. Error: ${error.message}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referenceCode);
    alert('Reference code copied to clipboard!');
  };

  // Success Page - Material Design 3
  if (isSuccessPage) {
    // If no reference code, show error or redirect
    if (!referenceCode) {
      return (
        <div style={{ minHeight: '100vh', background: '#f7f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ textAlign: 'center', maxWidth: 500 }}>
            <div style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#EF4444' }}>error</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#000000', marginBottom: 12 }}>
              No Reference Code Found
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 32, lineHeight: 1.7 }}>
              It looks like you accessed this page directly. Please submit a concern first to get your reference code.
            </p>
            <button
              onClick={() => navigate('/submit')}
              style={{
                padding: '14px 32px',
                borderRadius: 12,
                border: 'none',
                background: '#0058be',
                color: 'white',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none' }}>arrow_back</span>
              <span style={{ pointerEvents: 'none' }}>Go to Submit Form</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="success-page-wrapper" style={{ minHeight: '100vh', background: '#f7f9fb', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative Background Blur Circles */}
        <div className="success-decorative-bg">
          <div className="blur-circle blur-circle-blue" style={{
            width: 400,
            height: 400,
            top: -100,
            right: -100,
          }} />
          <div className="blur-circle blur-circle-purple" style={{
            width: 300,
            height: 300,
            bottom: -50,
            left: -50,
          }} />
          <div className="blur-circle blur-circle-teal" style={{
            width: 350,
            height: 350,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 20px 60px', maxWidth: 900, margin: '0 auto' }}>
          
          {/* Glass Morphism Main Card */}
          <div className="glass-panel" style={{
            padding: 48,
            textAlign: 'center',
            borderRadius: 24,
            marginBottom: 32,
          }}>
            {/* Large Check Circle Icon */}
            <div style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'scaleIn 0.5s ease-out',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#10B981', fontWeight: 600 }}>check_circle</span>
            </div>

            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 12, fontFamily: 'Public Sans, sans-serif' }}>
              Concern Submitted Successfully!
            </h2>

            <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 40, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 40px' }}>
              Thank you for reporting. Your concern has been received and will be reviewed by our team.
            </p>

            {/* Reference Code Box with Hover Effect */}
            <div className="ref-code-box" style={{
              background: 'white',
              border: '2px solid #E5E7EB',
              borderRadius: 16,
              padding: 32,
              marginBottom: 40,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Reference Code
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 36, fontWeight: 700, color: '#000000', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                  {referenceCode}
                </p>
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Copy to clipboard"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#0058be', pointerEvents: 'none' }}>content_copy</span>
                </button>
              </div>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                Save this code to track your concern anytime
              </p>
            </div>

            {/* Two-Column Instruction Cards */}
            <div className="instruction-cards">
              <div className="instruction-card">
                <div className="instruction-icon" style={{ background: 'rgba(0, 88, 190, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#0058be' }}>bookmark</span>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 4 }}>
                    Save Your Code
                  </h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                    Keep this reference code safe for tracking
                  </p>
                </div>
              </div>

              <div className="instruction-card">
                <div className="instruction-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#10B981' }}>search</span>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 4 }}>
                    Track Status
                  </h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                    Use the code to check progress anytime
                  </p>
                </div>
              </div>

              <div className="instruction-card">
                <div className="instruction-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#F59E0B' }}>mail</span>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 4 }}>
                    Email Updates
                  </h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                    You'll receive notifications via email
                  </p>
                </div>
              </div>

              <div className="instruction-card">
                <div className="instruction-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#8B5CF6' }}>verified</span>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 4 }}>
                    Confirm Resolution
                  </h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                    Verify when the issue is resolved
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
              <button
                onClick={() => navigate(`/track/${referenceCode}`)}
                style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#0058be',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#004a9f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0058be';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none' }}>search</span>
                <span style={{ pointerEvents: 'none' }}>Track Status</span>
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  border: '2px solid #E5E7EB',
                  background: 'white',
                  color: '#374151',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none' }}>home</span>
                <span style={{ pointerEvents: 'none' }}>Back to Home</span>
              </button>
            </div>
          </div>

          {/* Bento Context Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Download Receipt Card */}
            <div className="bento-context-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(0, 88, 190, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#0058be' }}>download</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000000', fontFamily: 'Public Sans, sans-serif' }}>
                  Download Receipt
                </h3>
              </div>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                Get a PDF copy of your submission for your records
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, pointerEvents: 'none' }}>picture_as_pdf</span>
                <span style={{ pointerEvents: 'none' }}>Download PDF</span>
              </button>
            </div>

            {/* Share Updates Card */}
            <div className="bento-context-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#10B981' }}>share</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000000', fontFamily: 'Public Sans, sans-serif' }}>
                  Share Updates
                </h3>
              </div>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                Share your concern with others in your community
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, pointerEvents: 'none' }}>ios_share</span>
                <span style={{ pointerEvents: 'none' }}>Share Link</span>
              </button>
            </div>
          </div>

          {/* Office Banner */}
          <div style={{
            marginTop: 32,
            padding: 32,
            borderRadius: 16,
            background: '#0D9488',
            color: 'white',
            textAlign: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}>account_balance</span>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Office of Public Service
            </p>
            <p style={{ fontSize: 14, opacity: 0.9 }}>
              Serving the citizens of San Vicente with integrity and care.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form Page
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)', padding: '80px 20px 60px' }}>
      <div style={{ maxWidth: 'var(--form-max-width)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'white',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, pointerEvents: 'none' }}>arrow_back</span>
            <span style={{ pointerEvents: 'none' }}>Back to Home</span>
          </button>

          <h1 style={{ fontSize: 32, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 8 }}>
            Submit a Concern
          </h1>
          <p style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>
            Report issues, suggest improvements, or request assistance from barangay officials.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="civic-card" style={{ padding: 'var(--card-padding-desktop)' }}>
          
          {/* Section 1: Personal Information */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-primary)' }}>person</span>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>
                Personal Information
              </h2>
            </div>

            <div style={{ display: 'grid', gap: 20 }}>
              {/* Full Name */}
              <div>
                <label className="form-label required">Full Name</label>
                <input
                  type="text"
                  className="civic-input"
                  placeholder="Juan Dela Cruz"
                  value={formData.guest_name}
                  onChange={(e) => updateField('guest_name', e.target.value)}
                  onBlur={() => handleBlur('guest_name')}
                />
                {errors.guest_name && (
                  <p className="error-message">{errors.guest_name}</p>
                )}
              </div>

              {/* Contact Number & Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="form-label required">Contact Number</label>
                  <input
                    type="tel"
                    className="civic-input"
                    placeholder="09123456789"
                    value={formData.guest_phone}
                    onChange={(e) => updateField('guest_phone', e.target.value)}
                    onBlur={() => handleBlur('guest_phone')}
                  />
                  {errors.guest_phone && (
                    <p className="error-message">{errors.guest_phone}</p>
                  )}
                </div>

                <div>
                  <label className="form-label required">Address</label>
                  <input
                    type="text"
                    className="civic-input"
                    placeholder="Purok 1, San Vicente"
                    value={formData.guest_address}
                    onChange={(e) => updateField('guest_address', e.target.value)}
                    onBlur={() => handleBlur('guest_address')}
                  />
                  {errors.guest_address && (
                    <p className="error-message">{errors.guest_address}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label required">Email Address</label>
                <input
                  type="email"
                  className="civic-input"
                  placeholder="juan@example.com"
                  value={formData.guest_email}
                  onChange={(e) => updateField('guest_email', e.target.value)}
                  onBlur={() => handleBlur('guest_email')}
                />
                {errors.guest_email && (
                  <p className="error-message">{errors.guest_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Concern Details */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-primary)' }}>description</span>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>
                Concern Details
              </h2>
            </div>

            <div style={{ display: 'grid', gap: 20 }}>
              {/* Category */}
              <div>
                <label className="form-label required">Category</label>
                <select
                  className="civic-select"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  onBlur={() => handleBlur('category')}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="error-message">{errors.category}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="form-label required">Description</label>
                <textarea
                  className="civic-textarea"
                  placeholder="Please describe your concern in detail..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  rows={4}
                  maxLength={1000}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {errors.description ? (
                    <p className="error-message">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {formData.description.length} / 1000
                  </span>
                </div>
              </div>

              {/* Specific Location */}
              <div>
                <label className="form-label required">Specific Location</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                  <input
                    type="text"
                    className="civic-input"
                    placeholder="e.g., Corner of Main St. and 2nd Ave."
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    onBlur={() => handleBlur('location')}
                  />
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={locating}
                    className="btn-teal"
                    style={{ whiteSpace: 'nowrap', color: '#ffffff' }}
                  >
                    {locating ? (
                      <>
                        <span className="material-symbols-outlined spinning" style={{ fontSize: 16, pointerEvents: 'none', color: '#ffffff' }}>progress_activity</span>
                        <span style={{ pointerEvents: 'none', color: '#ffffff' }}>Locating...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, pointerEvents: 'none', color: '#ffffff' }}>location_on</span>
                        <span style={{ pointerEvents: 'none', color: '#ffffff' }}>Locate Me</span>
                      </>
                    )}
                  </button>
                </div>
                {errors.location && (
                  <p className="error-message">{errors.location}</p>
                )}
              </div>

              {/* Urgency Level */}
              <div>
                <label className="form-label required">Urgency Level</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {URGENCY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateField('severity', level.value)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-badge)',
                        border: formData.severity === level.value ? `2px solid ${level.color}` : '1px solid var(--color-border)',
                        background: formData.severity === level.value ? `${level.color}15` : 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        color: formData.severity === level.value ? level.color : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Media Evidence */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-primary)' }}>attach_file</span>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>
                Media Evidence (Optional)
              </h2>
            </div>

            {/* Upload Zone */}
            <div
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onClick={() => document.getElementById('photo-input').click()}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--color-text-muted)', display: 'block', margin: '0 auto 12px' }}>upload</span>
              <p style={{ fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Drag and drop photos here or click to browse
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Max 3 files, 10MB each (JPEG, PNG, WebP)
              </p>
              <input
                id="photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            {errors.photos && (
              <p className="error-message" style={{ marginTop: 8 }}>{errors.photos}</p>
            )}

            {/* Photo Previews */}
            {formData.photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginTop: 16 }}>
                {formData.photos.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14, pointerEvents: 'none' }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}>
              <p style={{ fontSize: 14, color: 'var(--color-danger)' }}>{errors.submit}</p>
            </div>
          )}

          {/* reCAPTCHA Widget */}
          <div className="recaptcha-container" style={{ marginBottom: 24 }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => {
                console.log('reCAPTCHA token received:', token ? 'Valid' : 'Null');
                setCaptchaToken(token);
                setErrors(prev => ({ ...prev, captcha: null }));
              }}
              onExpired={() => {
                console.log('reCAPTCHA token expired');
                setCaptchaToken(null);
                setErrors(prev => ({ ...prev, captcha: 'reCAPTCHA expired. Please verify again.' }));
              }}
              onErrored={() => {
                console.log('reCAPTCHA error occurred');
                setCaptchaToken(null);
                setErrors(prev => ({ ...prev, captcha: 'reCAPTCHA error. Please refresh and try again.' }));
              }}
            />
            {errors.captcha && (
              <p className="error-message" style={{ marginTop: 8 }}>{errors.captcha}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !captchaToken}
            onClick={(e) => {
              console.log('Button clicked directly');
              // Let the form's onSubmit handle it, but log for debugging
            }}
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              fontSize: 16, 
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: (isSubmitting || !captchaToken) ? '#9CA3AF' : '#0058be',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              cursor: (isSubmitting || !captchaToken) ? 'not-allowed' : 'pointer',
              opacity: (isSubmitting || !captchaToken) ? 0.7 : 1,
              transition: 'all 0.2s ease',
              boxShadow: (isSubmitting || !captchaToken) ? 'none' : '0 2px 4px rgba(0, 88, 190, 0.2)',
              position: 'relative',
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && captchaToken) {
                e.currentTarget.style.background = '#004a9f';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 88, 190, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && captchaToken) {
                e.currentTarget.style.background = '#0058be';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 88, 190, 0.2)';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined spinning" style={{ fontSize: 20, pointerEvents: 'none', color: '#ffffff' }}>progress_activity</span>
                <span style={{ pointerEvents: 'none', color: '#ffffff' }}>Submitting...</span>
              </>
            ) : !captchaToken ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none', color: '#ffffff' }}>lock</span>
                <span style={{ pointerEvents: 'none', color: '#ffffff' }}>Complete reCAPTCHA to Submit</span>
              </>
            ) : (
              <>
                <span style={{ pointerEvents: 'none', color: '#ffffff' }}>Submit Concern</span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none', color: '#ffffff' }}>arrow_forward</span>
              </>
            )}
          </button>

          {/* Privacy Notice */}
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            By submitting, you agree to our privacy policy and the processing of your data for public service purposes.
          </p>
        </form>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .civic-card {
            padding: var(--card-padding-mobile) !important;
          }

          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="gridTemplateColumns: '1fr auto'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
