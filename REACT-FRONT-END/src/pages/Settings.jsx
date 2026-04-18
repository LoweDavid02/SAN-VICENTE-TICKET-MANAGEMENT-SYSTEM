import { useState } from 'react';
import { Toggle } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import { useT } from '../stores/langStore';

export default function Settings() {
  const { openModal } = useApp();
  const { t, lang } = useT();

  const isTl = lang === 'tl';

  const NOTIF_PREFS = [
    { id: 'urgent',  label: isTl ? 'Mga alerto sa baha at kagyat na sitwasyon' : 'Flash flood & urgent alerts',     description: isTl ? 'Agarang push para sa mga kritikal na insidente'                    : 'Immediate push for critical incidents',    defaultOn: true  },
    { id: 'daily',   label: isTl ? 'Mga pang-araw-araw na ulat'                : 'Daily summary reports',           description: isTl ? 'Digest sa katapusan ng araw na ipinapadala sa iyong email'    : 'End-of-day digest sent to your email',     defaultOn: true  },
    { id: 'assign',  label: isTl ? 'Mga abiso sa pagtatalaga ng ticket'        : 'Ticket assignment notifications', description: isTl ? 'Kapag ang isang ticket ay itinalaga sa iyong koponan'          : 'When a ticket is assigned to your team',   defaultOn: true  },
    { id: 'sms',     label: isTl ? 'Mga SMS alerto para sa kritikal na isyu'   : 'SMS alerts for critical issues',  description: isTl ? 'Text message para sa mataas na kalubhaang insidente'           : 'Text message for severity High incidents',  defaultOn: false },
    { id: 'weekly',  label: isTl ? 'Lingguhang digest ng pagganap'             : 'Weekly performance digest',       description: isTl ? 'Buod ng analytics tuwing Lunes ng umaga'                      : 'Analytics summary every Monday morning',   defaultOn: false },
  ];

  const [prefs, setPrefs] = useState(
    Object.fromEntries(NOTIF_PREFS.map((p) => [p.id, p.defaultOn]))
  );

  const save = () => {
    openModal('success', { title: t('prefsSaved'), message: t('prefsUpdated') });
  };

  const SYS_INFO = [
    { label: isTl ? 'Bersyon'       : 'Version',     value: 'v4.2.1-stable'                          },
    { label: isTl ? 'Huling Update' : 'Last Update', value: 'April 14, 2026'                         },
    { label: isTl ? 'Kapaligiran'   : 'Environment', value: isTl ? 'Produksyon' : 'Production'       },
    { label: 'Database',                              value: 'PostgreSQL 15.2'                        },
    { label: isTl ? 'Katayuan'      : 'Status',      value: t('allSystems'), green: true             },
  ];

  const QUICK_LINKS = isTl
    ? ['Dokumentasyon ng API', 'Patakaran sa Privacy', 'Gabay ng Gumagamit', 'Sentro ng Suporta', 'Katayuan ng Sistema']
    : ['API Documentation', 'Privacy Policy', 'User Guide', 'Support Center', 'System Status'];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* System info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>{t('systemInfo')}</h3>
          {SYS_INFO.map((r) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: r.green ? 'var(--green)' : 'var(--text-1)' }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>{t('quickLinks')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_LINKS.map((l) => (
              <a key={l} href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--brand)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'background .12s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                {l}<span style={{ color: 'var(--border-dark)' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{t('notifPrefs')}</h3>
        <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 8 }}>{t('notifPrefsDesc')}</p>
        {NOTIF_PREFS.map((p) => (
          <Toggle key={p.id} on={prefs[p.id]} onChange={() => setPrefs((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} label={p.label} description={p.description} />
        ))}
        <div style={{ marginTop: 20 }}>
          <button onClick={save} className="btn btn-brand" style={{ fontSize: 13 }}>{t('savePrefs')}</button>
        </div>
      </div>
    </div>
  );
}
