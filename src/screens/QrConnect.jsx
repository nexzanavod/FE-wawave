import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { connectWa, getWaStatus, logoutWa } from '../api/wa';

function WaveLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8L6 14L9 6L12 16L15 6L18 14L21 8" />
    </svg>
  );
}

function QrCanvas({ text }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, { width: 260, margin: 1 });
    }
  }, [text]);
  return (
    <div style={{ display: 'inline-block', padding: 16, background: 'white', border: '2px solid #F0EDFF', borderRadius: 16, position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: 8, borderRadius: 12, boxShadow: '0 2px 12px rgba(108,92,231,0.2)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(180deg, #6C5CE7, #4834D4)', display: 'grid', placeItems: 'center' }}>
          <WaveLogo />
        </div>
      </div>
    </div>
  );
}

export default function QrConnect() {
  const [state, setState] = useState('idle'); // idle | loading | qr | connected | error
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const clearTimers = () => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
  };

  const startPollingStatus = () => {
    intervalRef.current = setInterval(async () => {
      try {
        const s = await getWaStatus();
        if (s.status === 'connected') {
          clearTimers();
          setState('connected');
        }
      } catch { /* ignore */ }
    }, 3000);
  };

  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearTimers(); fetchQr(); return 60; }
        return c - 1;
      });
    }, 1000);
  };

  const fetchQr = async () => {
    clearTimers();
    setState('loading');
    setError('');
    try {
      const result = await connectWa();
      if (result.status === 'connected' || result.status === 'already_connected') {
        setState('connected');
        return;
      }
      if (result.qr) {
        setQr(result.qr);
        setState('qr');
        startPollingStatus();
        startCountdown();
      } else if (result.status === 'timeout') {
        setError('QR timed out. Click Refresh to try again.');
        setState('error');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get QR code');
      setState('error');
    }
  };

  useEffect(() => {
    // Check if already connected
    getWaStatus().then((s) => {
      if (s.status === 'connected') setState('connected');
      else fetchQr();
    }).catch(() => fetchQr());
    return clearTimers;
  }, []);

  const handleLogout = async () => {
    try { await logoutWa(); } catch { /* ignore */ }
    clearTimers();
    setState('idle');
    setQr(null);
    fetchQr();
  };

  const statusLabel = () => {
    if (state === 'loading') return { text: 'Generating QR…', color: '#B7841C', bg: '#FFF8E1', dot: '#FDCB6E' };
    if (state === 'qr') return { text: `Awaiting scan… (${countdown}s)`, color: '#B7841C', bg: '#FFF8E1', dot: '#FDCB6E' };
    if (state === 'connected') return { text: 'Connected!', color: '#00B894', bg: '#E6FFF5', dot: '#00B894' };
    if (state === 'error') return { text: 'Error', color: '#E17055', bg: '#FFE9E4', dot: '#E17055' };
    return { text: 'Idle', color: '#636E72', bg: '#F8F9FD', dot: '#636E72' };
  };

  const { text, color, bg, dot } = statusLabel();

  return (
    <Shell title="QR connect" sub="Link your WhatsApp Business account" search={false}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <div className="card" style={{ width: 520, padding: 36, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: bg, color, borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, boxShadow: `0 0 0 4px ${dot}40` }} />
            {text}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {state === 'connected' ? 'Connected!' : 'Scan to connect'}
          </h2>
          <p style={{ fontSize: 13, color: '#636E72', margin: '0 0 24px' }}>
            {state === 'connected'
              ? 'Your WhatsApp is linked. You can disconnect below or head to the dashboard.'
              : 'This QR refreshes every 60 seconds for security.'}
          </p>

          {state === 'loading' && (
            <div style={{ height: 292, display: 'grid', placeItems: 'center', color: '#636E72' }}>
              <div>Generating QR code…</div>
            </div>
          )}

          {state === 'qr' && qr && <QrCanvas text={qr} />}

          {state === 'connected' && (
            <div style={{ height: 292, display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E6FFF5', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                <Icon name="check" size={36} stroke="#00B894" />
              </div>
            </div>
          )}

          {state === 'error' && (
            <div style={{ height: 180, display: 'grid', placeItems: 'center' }}>
              <div style={{ color: '#E17055', fontSize: 14 }}>{error}</div>
            </div>
          )}

          {state !== 'connected' && (
            <div style={{ marginTop: 28, textAlign: 'left', background: '#F8F9FD', padding: 16, borderRadius: 10, border: '1px solid #DFE6E9' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#2D3436', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                How to connect
              </div>
              {[
                'Open your messaging app on your phone',
                'Tap Settings → Linked devices',
                'Tap "Link a device" and scan this QR',
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, fontSize: 13, color: '#2D3436' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#6C5CE7', color: 'white', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{i + 1}</span>
                  {t}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={fetchQr} disabled={state === 'loading'}><Icon name="refresh" />Refresh QR</button>
            <button className="btn btn-ghost" style={{ color: '#E17055' }} onClick={handleLogout}><Icon name="logout" />Disconnect</button>
          </div>

          <div style={{ marginTop: 20, fontSize: 11, color: '#636E72', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="lock" size={12} /> End-to-end encrypted · WAWave never reads your messages
          </div>
        </div>
      </div>
    </Shell>
  );
}
