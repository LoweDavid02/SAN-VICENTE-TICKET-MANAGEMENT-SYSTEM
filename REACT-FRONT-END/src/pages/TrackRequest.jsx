/**
 * TrackRequest.jsx — Beautiful Public Ticket Tracking
 * 
 * Modern, professional design matching the guest submission flow
 * No authentication required - guest-friendly experience
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, ArrowLeft, MapPin, Calendar, User, 
  CheckCircle2, Clock, AlertCircle, XCircle, Loader, Home, FileText 
} from 'lucide-react';
import axios from 'axios';
import GuestNavbar from '../components/GuestNavbar';

const STATUS_CONFIG = {
  'Pending': { color: '#F59E0B', icon: Clock, label: 'Pending' },
  'Under Review': { color: '#3B82F6', icon: AlertCircle, label: 'Under Review' },
  'In Progress': { color: '#8B5CF6', icon: Loader, label: 'In Progress' },
  'Completed': { color: '#10B981', icon: CheckCircle2, label: 'Completed' },
  'Rejected': { color: '#EF4444', icon: XCircle, label: 'Rejected' },
};

export default function TrackRequest() {
  const navigate = useNavigate();
  const { code } = useParams();
  const [trackingCode, setTrackingCode] = useState(code || '');
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    if (!trackingCode || trackingCode.trim().length < 5) {
      setError('Please enter a valid tracking code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTicket(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'}/guest/tickets/${trackingCode.trim()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.data.success) {
        setTicket(response.data.ticket);
      } else {
        setError(response.data.message || 'Ticket not found');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Tracking error:', err);
      }
      setError(
        err.response?.data?.message || 
        'Ticket not found. Please check your tracking code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if code is in URL
  useEffect(() => {
    if (code) {
      handleSearch();
    }
  }, [code]);

  const StatusIcon = ticket ? STATUS_CONFIG[ticket.status]?.icon || AlertCircle : null;
  const statusColor = ticket ? STATUS_CONFIG[ticket.status]?.color || '#6B7280' : null;

  return (
    <>
      <GuestNavbar />
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '104px 20px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header with Icon */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: 16, 
              background: '#0d9488', 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 4px 16px rgba(13, 148, 136, 0.2)'
            }}>
              <Search size={28} color="#fff" strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', marginBottom: 12, lineHeight: 1.2 }}>
              Track Your Request
            </h1>
            <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
              Enter your tracking code to check the status of your request
            </p>
          </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ marginBottom: 40 }}>
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            maxWidth: 600, 
            margin: '0 auto',
            background: '#fff',
            padding: 8,
            borderRadius: 16,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '2px solid #e2e8f0'
          }}>
            <input
              type="text"
              placeholder="Enter tracking code (e.g., SV-2026-00142)"
              value={trackingCode}
              onChange={(e) => {
                setTrackingCode(e.target.value.toUpperCase());
                setError(null);
              }}
              style={{ 
                flex: 1, 
                textTransform: 'uppercase', 
                fontFamily: 'var(--font-mono)',
                padding: '14px 16px',
                fontSize: 15,
                border: 'none',
                borderRadius: 12,
                outline: 'none',
                background: 'transparent',
                color: '#0f172a',
                fontWeight: 600
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 12,
                border: 'none',
                background: isLoading ? '#94a3b8' : '#0d9488',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: isLoading ? 'none' : '0 2px 8px rgba(13, 148, 136, 0.2)',
                transition: 'all 0.2s',
                minWidth: 120,
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(13, 148, 136, 0.2)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Track
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 32,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            animation: 'slideDown 0.3s ease-out',
            maxWidth: 600,
            margin: '0 auto 32px'
          }}>
            <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: '#DC2626', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* Ticket Details */}
        {ticket && (
          <div style={{ display: 'grid', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
            {/* Status Card */}
            <div style={{ 
              background: '#fff', 
              borderRadius: 20, 
              padding: 32,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: `${statusColor}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {StatusIcon && <StatusIcon size={24} color={statusColor} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Status</p>
                      <p style={{ fontSize: 18, fontWeight: 600, color: statusColor }}>
                        {ticket.status}
                      </p>
                    </div>
                  </div>

                  <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--txt)', marginBottom: 8 }}>
                    {ticket.title}
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span style={{ 
                      fontSize: 14, 
                      fontFamily: 'var(--font-mono)', 
                      color: 'var(--accent)',
                      fontWeight: 600
                    }}>
                      {ticket.tracking_id}
                    </span>
                    <span className="badge badge-slate">
                      {ticket.category}
                    </span>
                    <span className={`badge badge-${ticket.severity === 'High' ? 'red' : ticket.severity === 'Medium' ? 'amber' : 'green'}`}>
                      {ticket.severity} Priority
                    </span>
                  </div>

                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                    {ticket.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div style={{ minWidth: 200 }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Progress</p>
                  <div style={{ 
                    width: '100%', 
                    height: 8, 
                    background: 'var(--surface)', 
                    borderRadius: 99, 
                    overflow: 'hidden',
                    marginBottom: 8
                  }}>
                    <div style={{
                      width: `${ticket.progress}%`,
                      height: '100%',
                      background: statusColor,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>
                    {ticket.progress}% Complete
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {/* Location */}
              <div style={{ 
                background: '#fff', 
                borderRadius: 16, 
                padding: 24,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.08)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(20, 184, 166, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <MapPin size={18} color="#14b8a6" />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Location</h3>
                </div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{ticket.location}</p>
                {ticket.geocoded_address && (
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                    {ticket.geocoded_address}
                  </p>
                )}
              </div>

              {/* Submitted */}
              <div style={{ 
                background: '#fff', 
                borderRadius: 16, 
                padding: 24,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.08)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(20, 184, 166, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Calendar size={18} color="#14b8a6" />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Submitted</h3>
                </div>
                <p style={{ fontSize: 14, color: '#475569' }}>{ticket.created_at}</p>
              </div>

              {/* Assigned To */}
              {ticket.assigned_to && (
                <div style={{ 
                  background: '#fff', 
                  borderRadius: 16, 
                  padding: 24,
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.08)';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(20, 184, 166, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <User size={18} color="#14b8a6" />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Assigned To</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#475569' }}>{ticket.assigned_to.name}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {ticket.timeline && ticket.timeline.length > 0 && (
              <div style={{ 
                background: '#fff', 
                borderRadius: 20, 
                padding: 32,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={20} color="#14b8a6" />
                  Timeline
                </h3>

                <div style={{ position: 'relative' }}>
                  {/* Timeline line */}
                  <div style={{
                    position: 'absolute',
                    left: 19,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: '#e2e8f0'
                  }} />

                  {/* Timeline entries */}
                  <div style={{ display: 'grid', gap: 20 }}>
                    {ticket.timeline.map((entry, idx) => {
                      const EntryIcon = STATUS_CONFIG[entry.status]?.icon || AlertCircle;
                      const entryColor = STATUS_CONFIG[entry.status]?.color || '#6B7280';

                      return (
                        <div key={entry.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: `${entryColor}20`,
                            border: `2px solid ${entryColor}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            position: 'relative',
                            zIndex: 1
                          }}>
                            <EntryIcon size={16} color={entryColor} />
                          </div>

                          <div style={{ flex: 1, paddingTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>
                                {entry.status}
                              </p>
                              <span style={{ fontSize: 12, color: 'var(--dim)' }}>
                                {entry.created_at}
                              </span>
                            </div>
                            {entry.note && (
                              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                                {entry.note}
                              </p>
                            )}
                            <p style={{ fontSize: 12, color: 'var(--dim)' }}>
                              Updated by {entry.updated_by}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {ticket.guest_name && (
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 16, 
                padding: 28,
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
                  Contact Information
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Name:</span>
                    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{ticket.guest_name}</span>
                  </div>
                  {ticket.guest_email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Email:</span>
                      <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{ticket.guest_email}</span>
                    </div>
                  )}
                  {ticket.guest_phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Phone:</span>
                      <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{ticket.guest_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!ticket && !isLoading && !error && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Search size={40} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              No Request Found
            </h3>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
              Enter your tracking code above to view your request status
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
