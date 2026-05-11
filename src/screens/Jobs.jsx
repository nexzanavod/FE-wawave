import { useEffect, useState } from 'react';
import Shell from '../components/Shell';
import { getJobs, cancelJob } from '../api/messages';

const STATUS_COLORS = {
  pending: '#FDCB6E',
  verifying: '#A29BFE',
  running: '#74B9FF',
  completed: '#00B894',
  failed: '#E17055',
  cancelled: '#636E72',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data.jobs || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const id = setInterval(fetchJobs, 3000);
    return () => clearInterval(id);
  }, []);

  const handleCancel = async (jobId) => {
    if (!confirm('Cancel this job? Sent messages cannot be undone.')) return;
    try {
      await cancelJob(jobId);
      await fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <Shell title="Jobs" sub="Live progress of bulk message jobs" search={false}>
      {loading && <p>Loading jobs…</p>}
      {error && <p style={{ color: '#E17055' }}>{error}</p>}
      {!loading && jobs.length === 0 && <p style={{ color: '#636E72' }}>No jobs yet. Start a bulk send to see progress here.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {jobs.map((job) => {
          const done = (job.sent || 0) + (job.failed || 0);
          const progress = job.total > 0 ? Math.round((done / job.total) * 100) : 0;
          const isActive = ['running', 'pending', 'verifying'].includes(job.status);
          return (
            <div key={job.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    Job <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#636E72' }}>{job.id.slice(0, 8)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#636E72', marginTop: 2 }}>
                    {job.type === 'image' ? 'Image' : 'Text'} · Created {formatDate(job.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      background: STATUS_COLORS[job.status] || '#636E72',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {job.status}
                  </span>
                  {isActive && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(job.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{
                  height: 8,
                  borderRadius: 4,
                  background: '#DFE6E9',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg,#00CEC9,#00B894)',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6, color: '#636E72' }}>
                  <span>{done} / {job.total} ({progress}%)</span>
                  <span>
                    <b style={{ color: '#00B894' }}>{job.sent || 0}</b> sent ·{' '}
                    <b style={{ color: '#E17055' }}>{job.failed || 0}</b> failed
                  </span>
                </div>
              </div>

              {job.error && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#E17055' }}>
                  Error: {job.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
