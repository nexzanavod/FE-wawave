import { useState, useRef } from 'react';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { uploadRecipients, sendBulk, getJob, sendOne } from '../api/messages';

function EstimateCard({ count, settings }) {
  const delay = ((settings.minDelaySec + settings.maxDelaySec) / 2) || 15;
  const totalSec = count * delay + Math.floor(count / (settings.batchSize || 18)) * (settings.batchPauseMin || 4) * 60;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div>
        <div className="text-sm text-gray">Recipients</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{count.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-sm text-gray">Est. time</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{h > 0 ? `~${h}h ${m}m` : `~${m}m`}</div>
      </div>
      <div>
        <div className="text-sm text-gray">Delay range</div>
        <div className="text-mono" style={{ fontWeight: 600 }}>{settings.minDelaySec || 8}–{settings.maxDelaySec || 25} sec</div>
      </div>
      <div>
        <div className="text-sm text-gray">Daily limit</div>
        <div className="text-mono" style={{ fontWeight: 600 }}>{(settings.dailyLimit || 100).toLocaleString()} /day</div>
      </div>
    </div>
  );
}

function BulkTab() {
  const [message, setMessage] = useState('Hi {name} 👋\n\nYour order has been shipped! 📦\n\nThanks for choosing us!\n— The team');
  const [uploadId, setUploadId] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [settings] = useState({ minDelaySec: 8, maxDelaySec: 25, batchSize: 18, batchPauseMin: 4, dailyLimit: 100 });
  const fileRef = useRef(null);
  const pollRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = await uploadRecipients(file);
      setUploadId(data.uploadId);
      setUploadInfo(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSend = async () => {
    if (!uploadId) { setError('Upload a recipients file first.'); return; }
    setSending(true);
    setError('');
    try {
      const result = await sendBulk({ uploadId, message });
      setJob(result);
      pollRef.current = setInterval(async () => {
        try {
          const j = await getJob(result.jobId);
          setJob(j);
          if (['completed', 'failed', 'cancelled'].includes(j.status)) {
            clearInterval(pollRef.current);
            setSending(false);
          }
        } catch { /* ignore */ }
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Send failed');
      setSending(false);
    }
  };

  const recipientCount = uploadInfo?.validCount || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
      <div className="card">
        <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>Bulk campaign</h3>

        {error && (
          <div style={{ background: '#FFE9E4', color: '#E17055', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>{error}</div>
        )}

        {job && (
          <div style={{ background: job.status === 'completed' ? '#E6FFF5' : job.status === 'failed' ? '#FFE9E4' : '#F0EDFF', borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Job {job.jobId || job.id}</span>
              <span className={`badge badge-${job.status === 'completed' ? 'sent' : job.status === 'failed' ? 'failed' : 'pending'}`}>{job.status}</span>
            </div>
            {job.total > 0 && (
              <>
                <div className="progress" style={{ height: 8, marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: `${job.progress || 0}%` }} />
                </div>
                <div style={{ fontSize: 13, color: '#636E72', display: 'flex', gap: 20 }}>
                  <span>Sent: <b style={{ color: '#00B894' }}>{job.sent}</b></span>
                  <span>Failed: <b style={{ color: '#E17055' }}>{job.failed}</b></span>
                  <span>Total: <b>{job.total}</b></span>
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label className="label">Recipients file (CSV / XLSX)</label>
          <div
            style={{ border: '2px dashed #A29BFE', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: '#FAFAFE' }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFile} />
            {uploading ? (
              <span style={{ color: '#636E72', fontSize: 13 }}>Uploading…</span>
            ) : uploadInfo ? (
              <div>
                <div style={{ color: '#00B894', fontWeight: 600, fontSize: 14 }}>{uploadInfo.validCount} valid recipients</div>
                {uploadInfo.invalidCount > 0 && <div style={{ color: '#E17055', fontSize: 12, marginTop: 4 }}>{uploadInfo.invalidCount} invalid rows skipped</div>}
                <div style={{ color: '#6C5CE7', fontSize: 12, marginTop: 6 }}>Click to replace file</div>
              </div>
            ) : (
              <div>
                <Icon name="upload" size={24} stroke="#A29BFE" />
                <div style={{ color: '#636E72', fontSize: 13, marginTop: 8 }}>Click to upload CSV or XLSX</div>
                <div style={{ color: '#A29BFE', fontSize: 11, marginTop: 4 }}>Columns: number, message (max 10,000 rows)</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="label">Default message (used if file has no message column)</label>
            <span className="text-sm text-gray text-mono">{message.length} / 1024</span>
          </div>
          <textarea
            className="input"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1024}
          />
        </div>

        <button
          className="btn btn-accent"
          style={{ width: '100%', height: 48, fontSize: 15, marginTop: 12 }}
          onClick={handleSend}
          disabled={sending || uploading || !uploadId}
        >
          <Icon name="send" />
          {sending ? `Sending… ${job?.sent || 0}/${job?.total || recipientCount}` : `Send to ${recipientCount.toLocaleString()} contacts`}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600 }}>Live preview</h3>
          <div style={{ background: 'linear-gradient(180deg, #F0EDFF, #E8F4FD)', borderRadius: 12, padding: 20, minHeight: 200 }}>
            <div style={{ background: 'white', padding: '12px 14px', borderRadius: '14px 14px 14px 4px', maxWidth: '85%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {message.replace(/{name}/g, 'Alex').replace(/{order_id}/g, '#2341') || '…'}
              <div style={{ fontSize: 10, color: '#636E72', textAlign: 'right', marginTop: 6 }}>14:32 ✓✓</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Estimate</h3>
            <span className="badge badge-violet badge-no-dot">Anti-spam ON</span>
          </div>
          <EstimateCard count={recipientCount} settings={settings} />
        </div>

        {uploadInfo?.preview?.length > 0 && (
          <div className="card">
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Preview (first 5 rows)</h3>
            {uploadInfo.preview.map((row, i) => (
              <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid #F0EDFF', display: 'flex', gap: 12 }}>
                <span className="mono" style={{ color: '#636E72' }}>{row.number}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#2D3436' }}>{row.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SingleTab() {
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('');

  const handleSend = async () => {
    const num = number.trim();
    const msg = message.trim();
    if (!num || !msg) return;
    setStatus('sending');
    setError('');
    try {
      await sendOne(num, msg);
      setStatus('sent');
    } catch (err) {
      setError(err.response?.data?.error || 'Send failed');
      setStatus('error');
    }
  };

  const reset = () => { setStatus(null); setError(''); };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
      <div className="card">
        <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>Single message</h3>

        {status === 'sent' && (
          <div style={{ background: '#E6FFF5', color: '#00B894', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Message sent successfully!</span>
            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={reset}>Send another</button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#FFE9E4', color: '#E17055', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>{error}</div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label className="label">Recipient number</label>
          <input
            className="input"
            type="text"
            placeholder="+94771234567"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            disabled={status === 'sending'}
            style={{ fontFamily: 'JetBrains Mono' }}
          />
          <div style={{ fontSize: 12, color: '#636E72', marginTop: 4 }}>Include country code (e.g. +1, +94)</div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="label">Message</label>
            <span className="text-sm text-gray text-mono">{message.length} / 1024</span>
          </div>
          <textarea
            className="input"
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1024}
            disabled={status === 'sending'}
            placeholder="Type your message here…"
          />
        </div>

        <button
          className="btn btn-accent"
          style={{ width: '100%', height: 48, fontSize: 15, marginTop: 12 }}
          onClick={handleSend}
          disabled={status === 'sending' || !number.trim() || !message.trim()}
        >
          <Icon name="send" />
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600 }}>Live preview</h3>
        <div style={{ background: 'linear-gradient(180deg, #F0EDFF, #E8F4FD)', borderRadius: 12, padding: 20, minHeight: 220 }}>
          {message ? (
            <div style={{ background: 'white', padding: '12px 14px', borderRadius: '14px 14px 14px 4px', maxWidth: '85%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {message}
              <div style={{ fontSize: 10, color: '#636E72', textAlign: 'right', marginTop: 6 }}>14:32 ✓✓</div>
            </div>
          ) : (
            <div style={{ color: '#A29BFE', fontSize: 13, textAlign: 'center', paddingTop: 60 }}>Type a message to preview it</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SendMessages() {
  const [tab, setTab] = useState('bulk');

  return (
    <Shell title="Send messages" sub="Compose and broadcast to your audience">
      <div className="wa-page-head">
        <div>
          <h1>Send messages</h1>
          <p>Choose bulk campaign or single message</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          className={tab === 'bulk' ? 'btn btn-accent' : 'btn btn-outline'}
          onClick={() => setTab('bulk')}
        >
          <Icon name="send" size={15} />
          Bulk campaign
        </button>
        <button
          className={tab === 'single' ? 'btn btn-accent' : 'btn btn-outline'}
          onClick={() => setTab('single')}
        >
          <Icon name="phone" size={15} />
          Single message
        </button>
      </div>

      {tab === 'bulk' ? <BulkTab /> : <SingleTab />}
    </Shell>
  );
}
