import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { getWaStatus } from '../api/wa';

const NAV = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'qr', icon: 'qr', label: 'QR connect', path: '/qr' },
  { id: 'send', icon: 'send', label: 'Send messages', path: '/send' },
  { id: 'jobs', icon: 'chart', label: 'Jobs', path: '/jobs' },
  { id: 'logs', icon: 'chart', label: 'Message logs', path: '/logs' },
  { id: 'settings', icon: 'settings', label: 'Settings', path: '/settings' },
];

function WaveLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8L6 14L9 6L12 16L15 6L18 14L21 8" />
    </svg>
  );
}

function Sidebar({ badges = {} }) {
  const { user, subscription, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const [waStatus, setWaStatus] = useState(() => {
    try {
      const cached = localStorage.getItem('waStatus');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const s = await getWaStatus();
        if (cancelled) return;
        setWaStatus((prev) => {
          if (prev && prev.status === s.status && prev.phone === s.phone) return prev;
          try { localStorage.setItem('waStatus', JSON.stringify(s)); } catch { /* ignore */ }
          return s;
        });
      } catch { /* keep last known status on transient errors */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const connected = waStatus?.status === 'connected';
  const phoneDisplay = waStatus?.phone || '—';
  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';
  const planLabel = subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) + ' plan' : 'Free plan';

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <aside className="wa-sidebar">
      <div className="wa-logo">
        <div className="wa-logo-mark"><WaveLogo /></div>
        <div>
          <div className="wa-logo-text">WAWave</div>
          <div className="wa-logo-tag">Ride the messaging wave</div>
        </div>
      </div>

      <div className="wa-conn">
        <div
          className="wa-conn-dot"
          style={{
            background: connected ? '#00FFB2' : '#FF6B6B',
            boxShadow: `0 0 0 4px ${connected ? 'rgba(0,255,178,0.18)' : 'rgba(255,107,107,0.18)'}`,
          }}
        />
        <div className="wa-conn-text">
          <b>{connected ? 'Connected' : 'Disconnected'}</b>
          <span>{connected ? phoneDisplay : 'Not linked'}</span>
        </div>
      </div>

      <div className="wa-divider" />

      <nav className="wa-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 'wa-nav-item' + (isActive ? ' active' : '')}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {badges[item.id] && <span className="nav-badge">{badges[item.id]}</span>}
          </NavLink>
        ))}
      </nav>

      {subscription?.plan !== 'pro' && (
        <div className="wa-upgrade-btn" onClick={() => navigate('/pricing')}>
          ⚡ Upgrade to Pro
        </div>
      )}

      <div style={{ position: 'relative' }} ref={menuRef}>
        {menuOpen && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'white', borderRadius: 12, boxShadow: '0 8px 24px rgba(45,52,54,0.15)',
            padding: 6, zIndex: 50, border: '1px solid #DFE6E9',
          }}>
            <button
              onClick={() => { setMenuOpen(false); navigate('/pricing'); }}
              style={menuItemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FD'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="bolt" size={15} />
              <span>Change plan</span>
            </button>
            <button
              onClick={() => { setMenuOpen(false); navigate('/settings'); }}
              style={menuItemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FD'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="settings" size={15} />
              <span>Settings</span>
            </button>
            <div style={{ height: 1, background: '#DFE6E9', margin: '4px 6px' }} />
            <button
              onClick={() => { setMenuOpen(false); handleSignOut(); }}
              style={{ ...menuItemStyle, color: '#E17055' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFE9E4'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="logout" size={15} />
              <span>Sign out</span>
            </button>
          </div>
        )}
        <div
          className="wa-side-bottom"
          onClick={() => setMenuOpen((v) => !v)}
          style={{ cursor: 'pointer' }}
          title="Account menu"
        >
          <div className="wa-avatar">{userInitials}</div>
          <div className="wa-side-bottom-text">
            <b>{user?.email || '…'}</b>
            <span>{planLabel}</span>
          </div>
          <Icon name="chev" size={16} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </div>
      </div>
    </aside>
  );
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
  padding: '10px 12px', border: 'none', background: 'transparent',
  borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
  color: '#2D3436', textAlign: 'left',
};

function Topbar({ title, sub, search = true }) {
  return (
    <div className="wa-topbar">
      <div>
        <div className="wa-topbar-title">{title}</div>
        {sub && <div className="wa-topbar-sub">{sub}</div>}
      </div>
      <div className="wa-topbar-spacer" />
      {search && (
        <div className="wa-search">
          <Icon name="search" size={16} />
          <input placeholder="Search contacts, messages, templates…" />
        </div>
      )}
      <div className="wa-icon-btn">
        <Icon name="bell" size={16} />
        <div className="dot" />
      </div>
      <div className="wa-icon-btn">
        <Icon name="moon" size={16} />
      </div>
    </div>
  );
}

export default function Shell({ title, sub, children, search = true, badges }) {
  return (
    <div className="wa-screen">
      <Sidebar badges={badges} />
      <div className="wa-main">
        <Topbar title={title} sub={sub} search={search} />
        <div className="wa-content">{children}</div>
      </div>
    </div>
  );
}
