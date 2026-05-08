import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { getLogs } from '../api/messages';

const statusMap = { sent: 'badge-sent', failed: 'badge-failed', pending: 'badge-pending', invalid_number: 'badge-failed' };
const statusLabel = { sent: 'Delivered', failed: 'Failed', pending: 'Pending', invalid_number: 'Invalid' };

function formatTs(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function initials(num = '') {
  const digits = num.replace(/\D/g, '');
  return digits.slice(-4, -2) || '??';
}

const AVATAR_COLORS = ['#6C5CE7','#00CEC9','#A29BFE','#E17055','#74B9FF','#FDCB6E','#00B894'];
function avatarColor(id = '') {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export default function MessageLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    getLogs({ limit: 100 })
      .then((d) => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.number?.includes(q) || r.messageId?.toLowerCase().includes(q) || r.jobId?.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: logs.length,
    sent: logs.filter((r) => r.status === 'sent').length,
    pending: logs.filter((r) => r.status === 'pending').length,
    failed: logs.filter((r) => r.status === 'failed' || r.status === 'invalid_number').length,
  };

  return (
    <Shell title="Message logs" sub="Full delivery history across campaigns">
      <div className="wa-page-head">
        <div>
          <h1>Message logs</h1>
          <p>{logs.length} messages loaded</p>
        </div>
        <div className="actions">
          <button className="btn btn-outline" onClick={load}><Icon name="refresh" />Refresh</button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="wa-search" style={{ width: 280, height: 38 }}>
            <Icon name="search" size={14} />
            <input
              placeholder="Search by number or message ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              ['all', 'All', counts.all, '#F0EDFF', '#6C5CE7'],
              ['sent', 'Delivered', counts.sent, '#E6FFF5', '#00B894'],
              ['pending', 'Pending', counts.pending, '#FFF8E1', '#B7841C'],
              ['failed', 'Failed', counts.failed, '#FFE9E4', '#E17055'],
            ].map(([key, label, count, bg, fg]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{ background: filter === key ? fg : bg, color: filter === key ? 'white' : fg, border: 'none', height: 38, padding: '0 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {label} <span style={{ background: filter === key ? 'rgba(255,255,255,0.25)' : 'white', padding: '2px 6px', borderRadius: 6, fontSize: 11, fontFamily: 'JetBrains Mono' }}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#636E72' }}>Loading logs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#636E72' }}>
            {logs.length === 0 ? 'No messages sent yet.' : 'No results for this filter.'}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Number</th>
                <th>Type</th>
                <th>Status</th>
                <th>Message ID</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <>
                  <tr
                    key={r.id}
                    style={{ cursor: 'pointer', background: expanded === r.id ? '#F8F9FD' : undefined }}
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <td className="mono text-sm" style={{ color: '#636E72' }}>{formatTs(r.createdAt)}</td>
                    <td>
                      <div className="contact-cell">
                        <div className="contact-avatar" style={{ background: avatarColor(r.id), width: 28, height: 28, fontSize: 10 }}>
                          {initials(r.number)}
                        </div>
                        <span className="mono">{r.number}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-violet badge-no-dot">{r.type}</span></td>
                    <td><span className={'badge ' + (statusMap[r.status] || 'badge-pending')}>{statusLabel[r.status] || r.status}</span></td>
                    <td className="mono text-sm" style={{ color: '#636E72' }}>{r.messageId || '—'}</td>
                    <td><Icon name={expanded === r.id ? 'chev' : 'chevR'} size={14} stroke="#636E72" /></td>
                  </tr>
                  {expanded === r.id && (
                    <tr key={r.id + '-exp'}>
                      <td colSpan={6} style={{ background: '#F8F9FD', padding: '16px 24px', borderBottom: '1px solid #DFE6E9' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontSize: 13 }}>
                          <div>
                            {r.error && (
                              <>
                                <div className="label" style={{ color: '#E17055' }}>Error</div>
                                <div style={{ background: 'white', border: '1px solid #FFD3C7', borderRadius: 8, padding: 12, color: '#E17055', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{r.error}</div>
                              </>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-gray">Log ID</span><span className="text-mono text-sm">{r.id}</span></div>
                            {r.jobId && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-gray">Job ID</span><span className="text-mono text-sm">{r.jobId}</span></div>}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-gray">Number</span><span className="text-mono">{r.number}</span></div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                              <button className="btn btn-sm btn-outline" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(r.id); }}><Icon name="copy" size={12} />Copy ID</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
