/**
 * TrackConcern.jsx — Track Your Concern (Material Design 3)
 * Glass morphism, bento grid layout, timeline with vertical line
 * Material Symbols Outlined icons, modern professional design
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/axios';

// Material Symbols Outlined icon mapping
const STATUS_CONFIG = {
  'Pending': { color: '#6B7280', icon: 'schedule', label: 'Pending' },
  'Under Review': { color: '#F59E0B', icon: 'analytics', label: 'Under Review' },
  'In Progress': { color: '#3B82F6', icon: 'autorenew', label: 'In Progress' },
  'Completed': { color: '#10B981', icon: 'check_circle', label: 'Completed' },
  'Verified & Closed': { color: '#0D9488', icon: 'verified', label: 'Verified & Closed' },
  'Rejected': { color: '#EF4444', icon: 'cancel', label: 'Rejected' },
};

export default function TrackConcern() {
  const navigate = useNavigate();
  const { code } = useParams();
  
  const [referenceCode, setReferenceCode] = useState(code || '');
  const [ticket, setTicket] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationNote, setConfirmationNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSearch = async (e) => { 
    e?.preventDefault();
    
    if (!referenceCode || referenceCode.trim().length < 5) {
      setError('Please enter a valid reference code');
      return;
    }

    setIsSearching(true);
    setError(null);
    setTicket(null);

    try {
      const response = await api.post('/tickets/track', {
        reference_code: referenceCode.trim().toUpperCase(),
      });

      if (response.data.success) {
        setTicket(response.data.ticket);
      } else {
        setError(response.data.message || 'Ticket not found');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      
      if (err.response?.status === 404) {
        setError('No ticket found with this reference code.');
      } else {
        setError('Failed to retrieve ticket information. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmResolution = async (resolved) => {
    setIsConfirming(true);

    try {
      const response = await api.patch(
        `/tickets/${ticket.tracking_id || ticket.reference_code}/confirm`,
        {
          resolved: resolved,
          note: confirmationNote || null,
        }
      );

      if (response.data.success) {
        // Refresh ticket data
        await handleSearch();
        setShowConfirmation(false);
        setConfirmationNote('');
        alert(response.data.message);
      } else {
        alert(response.data.message || 'Failed to confirm resolution');
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      alert('Failed to process confirmation. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Auto-search if code is in URL
  useEffect(() => {
    if (code) {
      handleSearch();
    }
  }, [code]);

  const statusIcon = ticket ? STATUS_CONFIG[ticket.status]?.icon || 'info' : null;
  const statusColor = ticket ? STATUS_CONFIG[ticket.status]?.color || '#6B7280' : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fb', position: 'relative' }}>
      {/* Professional Back to Home Button - Top Left */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: 24,
          left: 24,
          zIndex: 100,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
          background: 'white',
          fontSize: 14,
          fontWeight: 600,
          color: '#374151',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F9FAFB';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18, pointerEvents: 'none' }}>arrow_back</span>
        <span style={{ pointerEvents: 'none' }}>Back to Home</span>
      </button>

      {/* Hero Section with Gradient Background */}
      <div className="track-hero">
        <div className="track-hero-content">
          <h1 style={{ fontSize: 42, fontWeight: 700, color: 'white', marginBottom: 12, fontFamily: 'Public Sans, sans-serif' }}>
            Track Your Concern
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)', maxWidth: 600, margin: '0 auto' }}>
            Enter your reference code to check the real-time status of your concern
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px' }}>
        
        {/* Glass Morphism Search Panel */}
        <div className="search-panel-wrapper">
          <div className="glass-panel" style={{ padding: 12, borderRadius: 16 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Enter reference code (e.g., SV-2026-00142)"
                  value={referenceCode}
                  onChange={(e) => {
                    setReferenceCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: 16,
                    border: 'none',
                    borderRadius: 12,
                    outline: 'none',
                    background: 'white',
                    color: '#000000',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  padding: '16px 32px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#0058be',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  opacity: isSearching ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !isSearching && (e.currentTarget.style.background = '#004a9f')}
                onMouseLeave={(e) => !isSearching && (e.currentTarget.style.background = '#0058be')}
              >
                {isSearching ? (
                  <>
                    <span className="material-symbols-outlined spinning" style={{ fontSize: 20, pointerEvents: 'none' }}>progress_activity</span>
                    <span style={{ pointerEvents: 'none' }}>Searching...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none', color: '#ffffff' }}>search</span>
                    <span style={{ pointerEvents: 'none', color: '#ffffff' }}>Track Status</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#EF4444', flexShrink: 0 }}>error</span>
            <p style={{ fontSize: 14, color: '#EF4444', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              {error}
            </p>
          </div>
        )}

        {/* Ticket Result - Bento Grid Layout */}
        {ticket && (
          <div className="bento-grid">
            {/* Main Content Column */}
            <div className="bento-main">
              
              {/* Status Card with Glass Effect */}
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    {/* Status Badge with Pulse */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `${statusColor}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${statusColor}30`,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 28, color: statusColor }}>{statusIcon}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Current Status
                        </p>
                        <div className={`status-badge ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: 14, padding: '8px 14px' }}>
                          <span className={`status-dot ${ticket.status.toLowerCase().replace(/\s+/g, '-')} pulse`} />
                          {ticket.status}
                        </div>
                      </div>
                    </div>

                    {/* Reference Code */}
                    <p style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Reference Code
                    </p>
                    <h2 style={{ fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace' }}>
                      {ticket.tracking_id || ticket.reference_code}
                    </h2>

                    {/* Title */}
                    <h3 style={{ fontSize: 22, fontWeight: 600, color: '#000000', marginBottom: 12, fontFamily: 'Public Sans, sans-serif' }}>
                      {ticket.title}
                    </h3>

                    {/* Category & Priority Tags */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#F3F4F6',
                        color: '#374151',
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>category</span>
                        {ticket.category}
                      </span>
                      <span className={`status-badge ${ticket.severity === 'High' ? 'status-badge-red' : ticket.severity === 'Medium' ? 'status-badge-amber' : 'status-badge-green'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>priority_high</span>
                        {ticket.severity} Priority
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                      {ticket.description}
                    </p>
                  </div>

                  {/* Progress Circle */}
                  <div style={{ minWidth: 120, textAlign: 'center' }}>
                    <div style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: `conic-gradient(${statusColor} ${ticket.progress || 0}%, #E5E7EB ${ticket.progress || 0}%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                      <div style={{
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                          {ticket.progress || 0}%
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Complete</p>
                  </div>
                </div>

                {/* Latest Update Banner */}
                {ticket.timeline && ticket.timeline.length > 0 && (
                  <div style={{
                    background: 'rgba(0, 88, 190, 0.05)',
                    border: '1px solid rgba(0, 88, 190, 0.2)',
                    borderRadius: 12,
                    padding: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#0058be' }}>notifications_active</span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0058be' }}>
                        Latest Update
                      </p>
                      <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 'auto' }}>
                        {ticket.timeline[0].created_at}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                      {ticket.timeline[0].note || 'Status updated'}
                    </p>
                  </div>
                )}
              </div>

              {/* View Full History */}
              {ticket.timeline && ticket.timeline.length > 1 && (
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    background: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0058be',
                    cursor: 'pointer',
                    marginTop: 16,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, pointerEvents: 'none' }}>
                    {showTimeline ? 'expand_less' : 'expand_more'}
                  </span>
                  <span style={{ pointerEvents: 'none' }}>
                    {showTimeline ? 'Hide' : 'View'} Full History
                  </span>
                </button>
              )}

              {/* Timeline with Vertical Line */}
              {showTimeline && ticket.timeline && (
                <div style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 32,
                  border: '1px solid #E5E7EB',
                  marginTop: 24,
                }}>
                  <h4 style={{ fontSize: 18, fontWeight: 600, color: '#000000', marginBottom: 24, fontFamily: 'Public Sans, sans-serif' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>history</span>
                    Timeline History
                  </h4>
                  <div className="timeline-container">
                    <div className="timeline-line" />
                    {ticket.timeline.map((entry, idx) => {
                      const entryIcon = STATUS_CONFIG[entry.status]?.icon || 'info';
                      const entryColor = STATUS_CONFIG[entry.status]?.color || '#6B7280';

                      return (
                        <div key={idx} className="timeline-item">
                          <div className={`timeline-dot ${idx === 0 ? 'latest' : ''}`} style={{ borderColor: entryColor }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: entryColor }}>{entryIcon}</span>
                          </div>
                          <div className={`timeline-content ${idx > 0 ? 'older' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                              <p style={{ fontSize: 15, fontWeight: 600, color: '#000000' }}>
                                {entry.status}
                              </p>
                              {idx === 0 && (
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: 'rgba(0, 88, 190, 0.1)',
                                  color: '#0058be',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                }}>Latest</span>
                              )}
                              <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 'auto' }}>
                                {entry.created_at}
                              </span>
                            </div>
                            {entry.note && (
                              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 6, lineHeight: 1.6 }}>
                                {entry.note}
                              </p>
                            )}
                            <p style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                              Updated by {entry.updated_by}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Photos Section */}
            {ticket.images && ticket.images.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #E5E7EB',
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000000', marginBottom: 20, fontFamily: 'Public Sans, sans-serif' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>photo_library</span>
                  Attached Photos
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16,
                }}>
                  {ticket.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      <img
                        src={imageUrl}
                        alt={`Evidence photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="
                              width: 100%;
                              height: 200px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              background: #F3F4F6;
                              color: #6B7280;
                              font-size: 14px;
                            ">
                              <span class="material-symbols-outlined" style="font-size: 48px;">broken_image</span>
                            </div>
                          `;
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 500,
                      }}>
                        Photo {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {/* Location */}
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 24,
                border: '1px solid #E5E7EB',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(0, 88, 190, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#0058be' }}>location_on</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>
                    Location
                  </h3>
                </div>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                  {ticket.location}
                </p>
              </div>

              {/* Submitted */}
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 24,
                border: '1px solid #E5E7EB',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(0, 88, 190, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#0058be' }}>calendar_today</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>
                    Submitted
                  </h3>
                </div>
                <p style={{ fontSize: 14, color: '#6B7280' }}>
                  {ticket.created_at}
                </p>
              </div>

              {/* Assigned To */}
              {ticket.assigned_to && (
                <div style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 24,
                  border: '1px solid #E5E7EB',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(0, 88, 190, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#0058be' }}>person</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>
                      Assigned To
                    </h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#6B7280' }}>
                    {ticket.assigned_to.name}
                  </p>
                </div>
              )}
            </div>

            {/* Resident Confirmation (Only show if status is Completed) */}
            {ticket.status === 'Completed' && !showConfirmation && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 16,
                padding: 32,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#10B981' }}>task_alt</span>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000000' }}>
                    Has your concern been resolved?
                  </h3>
                </div>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
                  Please confirm if the issue has been addressed to your satisfaction.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleConfirmResolution(true)}
                    disabled={isConfirming}
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: '14px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background: '#10B981',
                      color: 'white',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: isConfirming ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: isConfirming ? 0.7 : 1,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none' }}>check_circle</span>
                    <span style={{ pointerEvents: 'none' }}>Yes, Resolved</span>
                  </button>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    disabled={isConfirming}
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: '14px 24px',
                      borderRadius: 12,
                      border: '2px solid #EF4444',
                      background: 'white',
                      color: '#EF4444',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: isConfirming ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: isConfirming ? 0.7 : 1,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none' }}>cancel</span>
                    <span style={{ pointerEvents: 'none' }}>Not Yet</span>
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Form (Not Resolved) */}
            {showConfirmation && (
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                border: '1px solid #E5E7EB',
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000000', marginBottom: 12 }}>
                  Tell us more
                </h3>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                  Please provide details about what still needs to be addressed.
                </p>
                <textarea
                  placeholder="Optional: Describe what still needs to be done..."
                  value={confirmationNote}
                  onChange={(e) => setConfirmationNote(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: 'Inter, sans-serif',
                    color: '#000000',
                    background: 'white',
                    resize: 'vertical',
                    marginBottom: 16,
                  }}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => handleConfirmResolution(false)}
                    disabled={isConfirming}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background: '#0058be',
                      color: 'white',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: isConfirming ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: isConfirming ? 0.7 : 1,
                    }}
                  >
                    {isConfirming ? (
                      <>
                        <span className="material-symbols-outlined spinning" style={{ fontSize: 18, pointerEvents: 'none' }}>progress_activity</span>
                        <span style={{ pointerEvents: 'none' }}>Submitting...</span>
                      </>
                    ) : (
                      <span style={{ pointerEvents: 'none' }}>Submit Feedback</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      setConfirmationNote('');
                    }}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                      background: 'white',
                      color: '#374151',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ pointerEvents: 'none' }}>Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="bento-sidebar">
            {/* Map Preview with Glass Overlay */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
            }}>
              <div className="map-preview">
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#9CA3AF' }}>map</span>
                  <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Map Preview</p>
                </div>
                <div className="map-overlay">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#0058be' }}>location_on</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#000000', margin: 0 }}>
                      {ticket.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section Card */}
            <div className="help-card">
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>help</span>
                Need Help?
              </h3>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20, lineHeight: 1.6 }}>
                Have questions about your concern? Contact us anytime.
              </p>
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="contact-card">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>call</span>
                  <div>
                    <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Phone</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>(02) 8123-4567</p>
                  </div>
                </div>
                <div className="contact-card">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>mail</span>
                  <div>
                    <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Email</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>support@sanvicente.gov.ph</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transparency Banner */}
            <div style={{
              background: '#0D9488',
              borderRadius: 16,
              padding: 24,
              color: 'white',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>verified_user</span>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Our Commitment to Transparency
              </h3>
              <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
                We're dedicated to keeping you informed every step of the way.
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Empty State */}
        {!ticket && !isSearching && !error && (
          <div style={{ textAlign: 'center', padding: '80px 20px', marginTop: 40 }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(0, 88, 190, 0.05)',
              border: '2px solid rgba(0, 88, 190, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#9CA3AF' }}>search</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#000000', marginBottom: 8 }}>
              No Concern Found
            </h3>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>
              Enter your reference code above to view your concern status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
