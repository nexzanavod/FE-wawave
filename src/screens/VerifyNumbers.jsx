import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { verifyNumber } from '../api/messages';

function VerifyBadge({ status }) {
  if (status === 'verified') return <span className="badge badge-sent">Verified</span>;
  if (status === 'notfound') return <span className="badge badge-failed">Not on app</span>;
  if (status === 'running') return <span className="badge badge-pending">Checking…</span>;
  return <span className="badge badge-pending">Error</span>;
}

export default function VerifyNumbers() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);

  const counts = {
    verified: results.filter((r) => r.status === 'verified').length,
    notfound: results.filter((r) => r.status === 'notfound').length,
    error: results.filter((r) => r.status === 'error').length,
  };

  const handleVerify = async () => {
    const numbers = input
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean);

    if (numbers.length === 0) return;

    cancelRef.current = false;
    setRunning(true);
    setProgress(0);

    const initialResults = numbers.map((n) => ({ number: n, status: 'running' }));
    setResults(initialResults);

    for (let i = 0; i < numbers.length; i++) {
      if (cancelRef.current) break;
      const num = numbers[i];
      try {
        const data = await verifyNumber(num);
        setResults((prev) =>
          prev.map((r, idx) => idx === i ? { number: num, status: data.exists ? 'verified' : 'notfound' } : r)
        );
      } catch (err) {
        const msg = err.response?.data?.error || 'error';
        setResults((prev) =>
          prev.map((r, idx) => idx === i ? { number: num, status: 'error', error: msg } : r)
        );
      }
      setProgress(((i + 1) / numbers.length) * 100);
    }
    setRunning(false);
  };

  const handleCancel = () => { cancelRef.current = true; };

  const navigate = useNavigate();
  const validNumbers = results.filter((r) => r.status === 'verified').map((r) => r.number);

  const keepOnlyValid = () => {
    if (validNumbers.length === 0) return;
    setInput(validNumbers.join('\n'));
    setResults([]);
  };

  const copyValid = async () => {
    if (validNumbers.length === 0) return;
    try {
      await navigator.clipboard.writeText(validNumbers.join('\n'));
      alert(`Copied ${validNumbers.length} valid numbers`);
    } catch {
      alert('Copy failed');
    }
  };

  const downloadValid = () => {
    if (validNumbers.length === 0) return;
    const blob = new Blob([validNumbers.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valid-numbers-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const useInSend = () => {
    if (validNumbers.length === 0) return;
    sessionStorage.setItem('wawave:verifiedNumbers', JSON.stringify(validNumbers));
    navigate('/send');
  };

  const pct = Math.round(progress);
  const done = results.filter((r) => r.status !== 'running').length;

  return (
    <Shell title="Verify numbers" sub="Check which contacts are reachable on WhatsApp">
      <div className="wa-page-head">
        <div>
          <h1>Verify numbers</h1>
          <p>Paste numbers below and verify them one by one</p>
        </div>
        <div className="actions">
          {!running && validNumbers.length > 0 && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={copyValid} title="Copy valid numbers">Copy ({validNumbers.length})</button>
              <button className="btn btn-ghost btn-sm" onClick={downloadValid} title="Download .txt">Download</button>
              <button className="btn btn-outline btn-sm" onClick={keepOnlyValid} title="Replace input with only valid numbers">Keep valid only</button>
            </>
          )}
          {running
            ? <button className="btn btn-outline" onClick={handleCancel}><Icon name="pause" size={14} />Pause</button>
            : <button className="btn btn-accent" onClick={handleVerify} disabled={!input.trim()}><Icon name="check" />Verify numbers</button>}
        </div>
      </div>

      {running && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F0EDFF', display: 'grid', placeItems: 'center', color: '#6C5CE7', flexShrink: 0 }}>
              <Icon name="bolt" size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Verifying · {done} of {results.length}</div>
                <div className="text-sm text-gray text-mono">{pct}%</div>
              </div>
              <div className="progress" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 12 }}>
                <span><span className="legend-dot" style={{ background: '#00B894' }} /> {counts.verified} verified</span>
                <span><span className="legend-dot" style={{ background: '#E17055' }} /> {counts.notfound} not on app</span>
                <span><span className="legend-dot" style={{ background: '#FDCB6E' }} /> {counts.error} errors</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
          <div className="metric">
            <div className="metric-icon" style={{ background: '#E6FFF5', color: '#00B894' }}><Icon name="check" /></div>
            <div className="metric-label">Verified</div>
            <div className="metric-value" style={{ color: '#00B894' }}>{counts.verified}</div>
          </div>
          <div className="metric">
            <div className="metric-icon" style={{ background: '#FFE9E4', color: '#E17055' }}><Icon name="x" /></div>
            <div className="metric-label">Not on app</div>
            <div className="metric-value" style={{ color: '#E17055' }}>{counts.notfound}</div>
          </div>
          <div className="metric">
            <div className="metric-icon" style={{ background: '#FFF8E1', color: '#B7841C' }}><Icon name="alert" /></div>
            <div className="metric-label">Errors</div>
            <div className="metric-value" style={{ color: '#B7841C' }}>{counts.error}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}>Enter numbers</h3>
          <p style={{ fontSize: 12, color: '#636E72', margin: '0 0 12px' }}>One per line, or comma/semicolon separated. Include country code (e.g. +94771234567).</p>
          <textarea
            className="input"
            rows={14}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'+94771234567\n+94712345678\n+94763456789'}
            disabled={running}
            style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}
          />
          <div style={{ marginTop: 10, fontSize: 12, color: '#636E72' }}>
            {input.split(/[\n,;]+/).filter((n) => n.trim()).length} numbers entered
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #DFE6E9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Results</h3>
            {running && <span className="badge badge-violet badge-no-dot">live</span>}
          </div>
          {results.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#636E72', fontSize: 13 }}>
              Results will appear here as numbers are verified.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr><th>Number</th><th>Status</th><th>Error</th></tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r.number}</td>
                    <td><VerifyBadge status={r.status} /></td>
                    <td style={{ fontSize: 12, color: '#E17055' }}>{r.error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Shell>
  );
}
