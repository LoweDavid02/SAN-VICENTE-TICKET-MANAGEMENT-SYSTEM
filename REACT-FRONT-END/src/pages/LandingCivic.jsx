/**
 * Landing.jsx — Barangay San Vicente Public Service Portal
 * Civic UI Design - Clean government interface with NO auth references
 */

import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Phone, MapPin, Calendar, FileText, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: 'var(--font-family)', background: 'var(--color-bg-page)', minHeight: '100vh' }}>
      
      {/* NAVBAR - Fixed, 64px, NO AUTH BUTTONS */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--navbar-height)',
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        zIndex: 1000,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={22} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1E2D4E', lineHeight: 1.2 }}>
                Barangay San Vicente
              </p>
              <p style={{ fontSize: 11, color: '#6B7280', letterSpacing: '0.05em' }}>
                Public Service Portal
              </p>
            </div>
          </div>

          {/* Center Nav Links - Desktop */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => scrollTo('#home')} className="nav-link">Home</button>
            <button onClick={() => scrollTo('#services')} className="nav-link">Services</button>
            <button onClick={() => scrollTo('#contact')} className="nav-link">Contact</button>
          </div>

         
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{
            }}>
             
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'white',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            background: 'white',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 24px',
          }}>
            <button onClick={() => scrollTo('#home')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', border: 'none', background: 'none', fontSize: 15, color: '#1F2937', cursor: 'pointer' }}>Home</button>
            <button onClick={() => scrollTo('#services')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', border: 'none', background: 'none', fontSize: 15, color: '#1F2937', cursor: 'pointer' }}>Services</button>
            <button onClick={() => scrollTo('#contact')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', border: 'none', background: 'none', fontSize: 15, color: '#1F2937', cursor: 'pointer' }}>Contact</button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="home" style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: 'var(--navbar-height)',
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
        }} />

        {/* Dark Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(30, 45, 78, 0.85)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '80px 40px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: 24,
            lineHeight: 1.2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}>
            Welcome to the official<br />San Vicente Service Portal
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#FFFFFF',
            opacity: 0.95,
            marginBottom: 60,
            maxWidth: 600,
            margin: '0 auto 60px',
            lineHeight: 1.6,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          }}>
            Your direct link to local governance and public assistance.
          </p>

          {/* Action Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 32,
            maxWidth: 900,
            margin: '0 auto',
          }}>
            {/* Submit Concern Card */}
            <div className="civic-card" style={{
              padding: 40,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onClick={() => navigate('/report')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <FileText size={32} color="white" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1E2D4E', marginBottom: 16 }}>
                Submit a Concern
              </h3>
              <p style={{ fontSize: 15, color: '#4B5563', marginBottom: 24, lineHeight: 1.7 }}>
                Report issues, suggest improvements, or request assistance directly from barangay officials.
              </p>
              <button className="btn-primary" style={{ width: '100%' }}>
                Get Started <ArrowRight size={16} />
              </button>
            </div>

            {/* Track Ticket Card */}
            <div className="civic-card" style={{
              padding: 40,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onClick={() => navigate('/track')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: 'var(--color-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <MapPin size={32} color="white" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1E2D4E', marginBottom: 16 }}>
                Track a Ticket
              </h3>
              <p style={{ fontSize: 15, color: '#4B5563', marginBottom: 24, lineHeight: 1.7 }}>
                Check the real-time status of your submitted reports using your ticket ID.
              </p>
              <button className="btn-outline" style={{ width: '100%' }}>
                Check Status
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK RESOURCES */}
      <section id="services" style={{ padding: '100px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 600, color: '#1E2D4E', marginBottom: 16 }}>
              Quick Resources
            </h2>
            <p style={{ fontSize: 18, color: '#4B5563' }}>
              Access essential barangay services and information
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 32,
          }}>
            {[
              { icon: Phone, title: 'Emergency Hotlines', desc: '24/7 Response Team', color: '#EF4444' },
              { icon: FileText, title: 'Barangay Clearance', desc: 'Online Application', color: '#3B82F6' },
              { icon: Calendar, title: 'Community Events', desc: 'Calendar & Announcements', color: '#F59E0B' },
              { icon: MapPin, title: 'District Map', desc: 'Boundaries & Landmarks', color: '#10B981' },
            ].map((item, idx) => (
              <div key={idx} className="civic-card" style={{
                padding: 32,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `${item.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <item.icon size={28} color={item.color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1E2D4E', marginBottom: 12 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 15, color: '#4B5563' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ padding: '80px 40px', background: 'var(--color-bg-page)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
          }}>
            {[
              { value: '98%', label: 'Ticket Resolution Rate' },
              { value: '1,284', label: 'Tickets Resolved' },
              { value: '14.2h', label: 'Avg Resolution Time' },
              { value: '25,000+', label: 'Residents Served' },
            ].map((stat, idx) => (
              <div key={idx} className="civic-card" style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ fontSize: 40, fontWeight: 700, color: '#1E2D4E', marginBottom: 12 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 14, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: '100px 40px', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 600, color: '#1E2D4E', marginBottom: 16 }}>
            Get in Touch
          </h2>
          <p style={{ fontSize: 18, color: '#4B5563', marginBottom: 48 }}>
            Have questions? Reach out to the Barangay San Vicente office.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
            marginBottom: 48,
          }}>
            {[
              { icon: Phone, label: 'Phone', value: '(02) 8123-4567' },
              { icon: MapPin, label: 'Address', value: 'San Vicente, Apalit, Pampanga' },
            ].map((item, idx) => (
              <div key={idx} className="civic-card" style={{ padding: 32 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'rgba(13, 148, 136, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <item.icon size={24} color="var(--color-teal)" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1E2D4E' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/report')} className="btn-primary">
              Submit Request <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/track')} className="btn-outline">
              Track Status
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--color-primary)', padding: '60px 40px 40px', color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 40,
            marginBottom: 40,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Shield size={24} color="white" />
                <span style={{ fontSize: 16, fontWeight: 700 }}>Barangay San Vicente</span>
              </div>
              <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>
                Serving the community with integrity and care.
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Links
              </p>
              <button onClick={() => navigate('/report')} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 14, padding: '4px 0', cursor: 'pointer', textAlign: 'left' }}>Submit Request</button>
              <button onClick={() => navigate('/track')} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 14, padding: '4px 0', cursor: 'pointer', textAlign: 'left' }}>Track Status</button>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contact
              </p>
              <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 6 }}>Phone: (02) 8123-4567</p>
              <p style={{ fontSize: 14, opacity: 0.8 }}>San Vicente, Apalit, Pampanga</p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              © 2026 Barangay San Vicente. All rights reserved.
            </p>
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              Public Service Portal v1.0
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }

        .nav-link:hover {
          background: var(--color-bg-page);
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none !important;
          }

          .mobile-menu-btn {
            display: flex !important;
          }
          
          /* Mobile spacing adjustments */
          section {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          
          #home > div {
            padding: 60px 20px !important;
          }
          
          #services,
          #contact {
            padding: 60px 20px !important;
          }
          
          footer {
            padding: 48px 20px 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
