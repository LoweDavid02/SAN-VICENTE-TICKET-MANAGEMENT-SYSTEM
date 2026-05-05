/**
 * TrackRequest.jsx — Public ticket tracking (no authentication required)
 * 
 * Allows anyone to track their request status using the tracking code.
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, ArrowLeft, MapPin, Calendar, User, 
  CheckCircle2, Clock, AlertCircle, XCircle, Loader, Home 
} from 'lucide-react';
import axios from 'axios';

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
      const response = await axios.get(`/api/v1/guest/tickets/${trackingCode.trim()}`, {
        baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
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
  useState(() => {
    if (code) {
      handleSearch();
    }
  }, [code]);

  const StatusIcon = ticket ? STATUS_CONFIG[ticket.status]?.icon || AlertCircle : null;
  const statusColor = ticket ? STATUS_CONFIG[ticket.status]?.color || '#6B7280' : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
            Track Your Request
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)' }}>
            Enter your tracking code to check the status of your request
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, maxWidth: 600 }}>
            <input
              type="text"
              className="input"
              placeholder="Enter tracking code (e.g., SV-2026-00142)"
              value={trackingCode}
              onChange={(e) => {
                setTrackingCode(e.target.value.toUpperCase());
                setError(null);
              }}
              style={{ flex: 1, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
            />
            <button
              type="submit"
              className="btn btn-brand"
              disabled={isLoading}
              style={{ minWidth: 120 }}
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

        {/* Ticket Details */}
        {ticket && (
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Status Card */}
            <div className="card" style={{ padding: 32 }}>
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
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <MapPin size={20} color="var(--accent)" />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Location</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>{ticket.location}</p>
                {ticket.geocoded_address && (
                  <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>
                    {ticket.geocoded_address}
                  </p>
                )}
              </div>

              {/* Submitted */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Calendar size={20} color="var(--accent)" />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Submitted</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>{ticket.created_at}</p>
              </div>

              {/* Assigned To */}
              {ticket.assigned_to && (
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <User size={20} color="var(--accent)" />
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Assigned To</h3>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>{ticket.assigned_to.name}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {ticket.timeline && ticket.timeline.length > 0 && (
              <div className="card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--txt)', marginBottom: 24 }}>
                  Timeline
                </h3>

                <div style={{ position: 'relative' }}>
                  {/* Timeline line */}
                  <div style={{
                    position: 'absolute',
                    left: 15,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'var(--border)'
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
              <div className="card" style={{ padding: 24, background: 'var(--surface)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--txt)', marginBottom: 16 }}>
                  Contact Information
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                    <strong style={{ color: 'var(--txt)' }}>Name:</strong> {ticket.guest_name}
                  </p>
                  {ticket.guest_email && (
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                      <strong style={{ color: 'var(--txt)' }}>Email:</strong> {ticket.guest_email}
                    </p>
                  )}
                  {ticket.guest_phone && (
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                      <strong style={{ color: 'var(--txt)' }}>Phone:</strong> {ticket.guest_phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!ticket && !isLoading && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Search size={32} color="var(--muted)" />
            </div>
            <p style={{ fontSize: 16, color: 'var(--muted)' }}>
              Enter your tracking code above to view your request status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
