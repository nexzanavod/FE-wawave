import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { getJobs, getLogs } from '../api/messages';

const COLORS = ['#6C5CE7','#00CEC9','#A29BFE','#E17055','#74B9FF','#FDCB6E','#00B894'];

function initials(email = '') {
  const parts = email.split('@')[0].split(/[._-]/);
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || parts[0]?.[1] || '').toUpperCase();
}

function avatarColor(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}

function SparkLine({ data = [] }) {
  if (!data.length) return <div style={{ height: 220, display: 'grid', placeItems: 'center', color: '#aaa' }}>No data yet</div>;
  const max = Math.max(...data.map((d) => d.total), 1);
  const W = 660, H = 110, count = data.length;
  const pts = data.map((d, i) => [Math.round((i / Math.max(count - 1, 1)) * W), Math.round(H - (d.total / max) * H * 0.85)]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const area = path + ` L ${W} ${H} L 0 ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} 130`} width="100%" height="220" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00CEC9" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#00CEC9" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[20,50,80,110].map(y => (
        <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="#DFE6E9" strokeWidth="1" strokeDasharray="3 4"/>
      ))}
      <path d={area} fill="url(#lineGrad)" />
      <path d={path} fill="none" stroke="#6C5CE7" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="white" stroke="#6C5CE7" strokeWidth="2"/>
      ))}
    </svg>
  );
}

function Donut({ sent, failed, pending }) {
  const total = sent + failed + pending || 1;
  const delivered = sent;
  const segs = [
    { val: delivered / total, color: '#6C5CE7' },
    { val: pending / total, color: '#FDCB6E' },
    { val: failed / total, color: '#E17055' },
  ];
  const C = 2 * Math.PI * 56;
  let off = 0;
  const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;
  return (
    <svg viewBox="0 0 160 160" width="180" height="180">
      <circle cx="80" cy="80" r="56" fill="none" stroke="#F0EDFF" strokeWidth="20" />
      {segs.map((s, i) => {
        const len = s.val * C;
        const dash = `${len} ${C - len}`;
        const dashoff = -off;
        off += len;
        return (
          <circle key={i} cx="80" cy="80" r="56" fill="none"
            stroke={s.color} strokeWidth="20"
            strokeDasharray={dash} strokeDashoffset={dashoff}
            transform="rotate(-90 80 80)" strokeLinecap="butt" />
        );
      })}
      <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2D3436" fontFamily="JetBrains Mono">{pct}%</text>
      <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#636E72" fontWeight="500">Delivery rate</text>
    </svg>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard() {
  const { user, usage, subscription } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    Promise.all([
      getJobs().then((d) => setJobs(d.jobs || [])),
      getLogs({ limit: 200 }).then((d) => setLogs(d.logs || [])),
    ])
      .catch((err) => setApiError(err.response?.data?.error || err.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const totalSent = logs.filter((l) => l.status === 'sent').length;
  const totalFailed = logs.filter((l) => l.status === 'failed').length;
  const totalPending = jobs.filter((j) => j.status === 'pending' || j.status === 'running')
    .reduce((s, j) => s + ((j.total || 0) - (j.sent || 0) - (j.failed || 0)), 0);
  const deliveryRate = totalSent + totalFailed > 0
    ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)
    : '—';

  // Build last-7-days chart data from logs
  const dayMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = { date: key, total: 0 };
  }
  for (const log of logs) {
    if (log.status !== 'sent') continue;
    const key = (log.createdAt || '').slice(0, 10);
    if (dayMap[key]) dayMap[key].total += 1;
  }
  const chartData = Object.values(dayMap);

  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const firstName = user?.email?.split('@')[0] || 'there';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Shell title="Dashboard" sub="Overview of your messaging campaigns">
      <div className="wa-page-head">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋</h1>
          <p>Here's what's happening with your campaigns today, {today}.</p>
        </div>
        <div className="actions">
          <button className="btn btn-outline" onClick={() => window.location.href = '/send'}><Icon name="sparkle" />New campaign</button>
        </div>
      </div>

      {apiError && (
        <div style={{ background: '#FFE9E4', color: '#E17055', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          API error: {apiError}
        </div>
      )}

      <div className="metric-grid">
        <div className="metric">
          <div className="metric-icon" style={{ background: '#F0EDFF', color: '#6C5CE7' }}><Icon name="send" /></div>
          <div className="metric-label">Total sent</div>
          <div className="metric-value">{loading ? '…' : totalSent.toLocaleString()}</div>
          <div className="metric-delta up"><Icon name="check" size={12} />All time</div>
        </div>
        <div className="metric">
          <div className="metric-icon" style={{ background: '#E6FFF5', color: '#00B894' }}><Icon name="check" /></div>
          <div className="metric-label">Delivery rate</div>
          <div className="metric-value">{loading ? '…' : deliveryRate + '%'}</div>
          <div className="metric-delta up"><Icon name="arrowUp" size={12} />vs failed</div>
        </div>
        <div className="metric">
          <div className="metric-icon" style={{ background: '#FFE9E4', color: '#E17055' }}><Icon name="alert" /></div>
          <div className="metric-label">Failed</div>
          <div className="metric-value">{loading ? '…' : totalFailed.toLocaleString()}</div>
          <div className="metric-delta down"><Icon name="arrowDown" size={12} />All time</div>
        </div>
        <div className="metric">
          <div className="metric-icon" style={{ background: '#FFF8E1', color: '#B7841C' }}><Icon name="clock" /></div>
          <div className="metric-label">Sent today</div>
          <div className="metric-value">{loading ? '…' : (usage?.sentToday ?? totalPending).toLocaleString()}</div>
          <div className="metric-delta"><Icon name="bolt" size={12} />
            {subscription ? `Limit: ${subscription.dailyLimit}/day` : 'Daily usage'}
          </div>
        </div>
      </div>

      <div className="chart-row">
        <div className="card">
          <div className="chart-head">
            <div>
              <h3>Messages sent</h3>
              <div className="text-sm text-gray">Last 7 days</div>
            </div>
            <div className="chart-legend">
              <div><span className="legend-dot" style={{ background: '#6C5CE7' }} />Sent</div>
            </div>
          </div>
          <SparkLine data={chartData} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#636E72' }}>
            {chartData.map((d) => (
              <span key={d.date}>{new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="chart-head">
            <h3>Delivery breakdown</h3>
            <Icon name="more" size={16} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <div style={{ height: 180, display: 'grid', placeItems: 'center' }}>…</div>
              : <Donut sent={totalSent} failed={totalFailed} pending={totalPending} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {[
              { c: '#6C5CE7', l: 'Sent', v: totalSent },
              { c: '#FDCB6E', l: 'Pending', v: totalPending },
              { c: '#E17055', l: 'Failed', v: totalFailed },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span className="legend-dot" style={{ background: r.c, width: 10, height: 10 }} />
                <span style={{ flex: 1 }}>{r.l}</span>
                <span className="text-mono" style={{ fontWeight: 600 }}>{r.v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recentJobs.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="chart-head">
            <div>
              <h3>Recent campaigns</h3>
              <div className="text-sm text-gray">Your last {recentJobs.length} bulk jobs</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/logs'}>View all<Icon name="chevR" size={14} /></button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Job ID</th><th>Type</th><th>Total</th><th>Sent</th><th>Failed</th><th>Status</th><th>Started</th></tr>
            </thead>
            <tbody>
              {recentJobs.map((j) => (
                <tr key={j.id}>
                  <td className="mono text-sm" style={{ color: '#636E72' }}>{j.id.slice(0, 8)}…</td>
                  <td><span className="badge badge-violet badge-no-dot">{j.type}</span></td>
                  <td className="mono">{j.total}</td>
                  <td className="mono" style={{ color: '#00B894', fontWeight: 600 }}>{j.sent}</td>
                  <td className="mono" style={{ color: j.failed > 0 ? '#E17055' : '#636E72' }}>{j.failed}</td>
                  <td>
                    <span className={`badge badge-${
                      j.status === 'completed' ? 'sent' :
                      j.status === 'failed' || j.status === 'cancelled' ? 'failed' : 'pending'
                    }`}>{j.status}</span>
                  </td>
                  <td className="text-sm text-gray">{timeAgo(j.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="chart-head">
          <div>
            <h3>Recent messages</h3>
            <div className="text-sm text-gray">Your latest {Math.min(logs.length, 10)} messages</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/logs'}>View all<Icon name="chevR" size={14} /></button>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#636E72' }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#636E72' }}>No messages yet. <a href="/send" style={{ color: '#6C5CE7', fontWeight: 600 }}>Send your first one →</a></div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Number</th><th>Type</th><th>Status</th><th>Message ID</th><th>Sent</th></tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((l) => (
                <tr key={l.id}>
                  <td className="mono">{l.number}</td>
                  <td><span className="badge badge-violet badge-no-dot">{l.type}</span></td>
                  <td>
                    <span className={`badge badge-${l.status === 'sent' ? 'sent' : 'failed'}`}>{l.status}</span>
                  </td>
                  <td className="mono text-sm" style={{ color: '#636E72' }}>{l.messageId ? l.messageId.slice(0, 12) + '…' : '—'}</td>
                  <td className="text-sm text-gray">{timeAgo(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
