/**
 * GuestSubmission.jsx — Public ticket submission (no authentication required)
 * 
 * Replaces the Resident Portal for ticket submissions.
 * Residents can submit requests without creating an account.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, MapPin, Upload, 
  AlertCircle, Loader, Home, Phone, Mail, User 
} from 'lucide-react';
import axios from 'axios';

const CATEGORIES = [
  { value: 'streetlight', label: 'Streetlight Issue', icon: '💡' },
  { value: 'drainage', label: 'Drainage Problem', icon: '🌊' },
  { value: 'road', label: 'Road Damage', icon: '🛣️' },
  { value: 'waste', label: 'Waste Management', icon: '🗑️' },
  { value: 'water', label: 'Water Supply', icon: '💧' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const SEVERITY_LEVELS = [
  { value: 'Low', label: 'Low', color: '#10B981', desc: 'Minor issue, not urgent' },
  { value: 'Medium', label: 'Medium', color: '#F59E0B', desc: 'Moderate issue, needs attention' },
  { value: 'High', label: 'High', color: '#EF4444', desc: 'Urgent issue, immediate action needed' },
];

export default function GuestSubmission() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [trackingCode, setTrackingCode] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    // Guest information
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_address: '',
    
    // Ticket information
    title: '',
    description: '',
    category: '',
    location: '',
    latitude: null,
    longitude: null,
    severity: 'Medium',
    images: [],
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.guest_name || formData.guest_name.length < 2) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.guest_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guest_email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.guest_phone || formData.guest_phone.length < 7) {
        setError('Please enter a valid phone number');
        return false;
      }
      if (!formData.guest_address || formData.guest_address.length < 10) {
        setError('Please enter your complete address');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.title || formData.title.length < 5) {
        setError('Please enter a title (at least 5 characters)');
        return false;
      }
      if (!formData.description || formData.description.length < 10) {
        setError('Please describe the issue (at least 10 characters)');
        return false;
      }
      if (!formData.category) {
        setError('Please select a category');
        return false;
      }
      if (!formData.location || formData.location.length < 5) {
        setError('Please enter the location');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${apiUrl}/api/v1/guest/tickets`, formData);

      if (response.data.success) {
        setTrackingCode(response.data.tracking_id);
        setStep(4); // Success step
      } else {
        setError(response.data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to submit your request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (step === 4 && trackingCode) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', 
            background: 'rgba(16, 185, 129, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle2 size={40} color="#10B981" />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--txt)', marginBottom: 12 }}>
            Request Submitted Successfully!
          </h1>

          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
            Your request has been received and assigned a tracking code. 
            Save this code to check the status of your request anytime.
          </p>

          <div style={{ 
            background: 'var(--surface)', 
            border: '2px solid var(--accent)', 
            borderRadius: 12, 
            padding: 24,
            marginBottom: 32
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Your Tracking Code
            </p>
            <p style={{ 
              fontSize: 32, 
              fontWeight: 700, 
              color: 'var(--accent)', 
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em'
            }}>
              {trackingCode}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/track/${trackingCode}`)}
              className="btn btn-brand"
              style={{ minWidth: 180 }}
            >
              Track My Request
            </button>
            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  guest_name: '',
                  guest_email: '',
                  guest_phone: '',
                  guest_address: '',
                  title: '',
                  description: '',
                  category: '',
                  location: '',
                  latitude: null,
                  longitude: null,
                  severity: 'Medium',
                  images: [],
                });
                setTrackingCode(null);
              }}
              className="btn btn-outline"
              style={{ minWidth: 180 }}
            >
              Submit Another Request
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost"
            style={{ marginTop: 24 }}
          >
            <Home size={16} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost"
            style={{ marginBottom: 20 }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

          <h1 style={{ fontSize: 32, fontWeight: 600, color: 'var(--txt)', marginBottom: 8 }}>
            Submit a Request
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)' }}>
            Report issues and request services from Barangay San Vicente
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          {['Contact Info', 'Request Details', 'Review'].map((label, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step > idx ? 'var(--accent)' : step === idx + 1 ? 'var(--accent)' : 'var(--surface)',
                border: step === idx + 1 ? '2px solid var(--accent)' : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600,
                color: step >= idx + 1 ? '#fff' : 'var(--muted)',
                flexShrink: 0
              }}>
                {step > idx ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span style={{ 
                fontSize: 13, 
                fontWeight: step === idx + 1 ? 600 : 400,
                color: step === idx + 1 ? 'var(--txt)' : 'var(--muted)',
                display: window.innerWidth < 640 ? 'none' : 'block'
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <AlertCircle size={20} color="#EF4444" />
            <p style={{ fontSize: 14, color: '#EF4444', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="card" style={{ padding: 32 }}>
          {/* Step 1: Contact Information */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--txt)', marginBottom: 24 }}>
                Your Contact Information
              </h2>

              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    <User size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Juan Dela Cruz"
                    value={formData.guest_name}
                    onChange={(e) => updateField('guest_name', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="juan@example.com"
                    value={formData.guest_email}
                    onChange={(e) => updateField('guest_email', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    <Phone size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+63 912 345 6789"
                    value={formData.guest_phone}
                    onChange={(e) => updateField('guest_phone', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    <Home size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Complete Address *
                  </label>
                  <textarea
                    className="input"
                    placeholder="House No., Street, Barangay San Vicente, Apalit, Pampanga"
                    value={formData.guest_address}
                    onChange={(e) => updateField('guest_address', e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Request Details */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--txt)', marginBottom: 24 }}>
                Request Details
              </h2>

              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    Request Title *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Broken streetlight on Main Street"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    Category *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => updateField('category', cat.value)}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          border: formData.category === cat.value ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: formData.category === cat.value ? 'var(--accent-bg)' : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--txt)' }}>{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    Description *
                  </label>
                  <textarea
                    className="input"
                    placeholder="Please describe the issue in detail..."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Location *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Corner of Main St. and 2nd Ave."
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--txt)', marginBottom: 8 }}>
                    Urgency Level *
                  </label>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {SEVERITY_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => updateField('severity', level.value)}
                        style={{
                          padding: 16,
                          borderRadius: 8,
                          border: formData.severity === level.value ? `2px solid ${level.color}` : '1px solid var(--border)',
                          background: formData.severity === level.value ? `${level.color}15` : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}
                      >
                        <div style={{
                          width: 12, height: 12, borderRadius: '50%',
                          background: level.color
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>
                            {level.label}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {level.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--txt)', marginBottom: 24 }}>
                Review Your Request
              </h2>

              <div style={{ display: 'grid', gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Contact Information
                  </h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Name:</strong> {formData.guest_name}</p>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Email:</strong> {formData.guest_email}</p>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Phone:</strong> {formData.guest_phone}</p>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Address:</strong> {formData.guest_address}</p>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Request Details
                  </h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Title:</strong> {formData.title}</p>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Category:</strong> {CATEGORIES.find(c => c.value === formData.category)?.label}</p>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Description:</strong> {formData.description}</p>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Location:</strong> {formData.location}</p>
                    <p style={{ fontSize: 14, color: 'var(--txt)' }}><strong>Urgency:</strong> {formData.severity}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid var(--border)'
          }}>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}

            <div style={{ marginLeft: 'auto' }}>
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="btn btn-brand"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="btn btn-brand"
                  disabled={isSubmitting}
                  style={{ minWidth: 140 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Submit Request
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
