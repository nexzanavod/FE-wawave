import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { getSettings, saveSettings } from '../api/settings';

const BOUNDS = {
  minDelaySec: [3, 120],
  maxDelaySec: [5, 300],
  batchSize: [1, 200],
  batchPauseMin: [0, 60],
  dailyLimit: [1, 10000],
};

function Slider({ field, value, max, min = 0, suffix, color = '#6C5CE7', onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{ flex: 1, position: 'relative', height: 6, background: '#DFE6E9', borderRadius: 3, cursor: 'pointer' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          onChange(field, Math.round(min + pct * (max - min)));
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${((value - min) / (max - min)) * 100}%`, background: color, borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: `calc(${((value - min) / (max - min)) * 100}% - 9px)`, top: -6, width: 18, height: 18, borderRadius: '50%', background: 'white', border: `3px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(field, Number(e.target.value))}
        style={{ width: 72, fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 14, textAlign: 'right', border: '1px solid #DFE6E9', borderRadius: 6, padding: '4px 8px', background: '#F8F9FD' }}
      />
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#636E72', minWidth: 36 }}>{suffix}</span>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 18 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#636E72', lineHeight: 1.5 }}>{desc}</p>
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="label">{label}</label>
      {children}
      {hint && <div className="text-sm text-gray" style={{ marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState({
    minDelaySec: 8,
    maxDelaySec: 25,
    batchSize: 18,
    batchPauseMin: 4,
    dailyLimit: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSettings()
      .then((d) => setSettings(d.settings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, raw) => {
    const [min, max] = BOUNDS[field] || [0, 9999];
    const val = Math.max(min, Math.min(max, Number(raw) || 0));
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const result = await saveSettings(settings);
      setSettings(result.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell title="Settings" sub="Account and sending preferences">
      <div className="wa-page-head">
        <div>
          <h1>Settings</h1>
          <p>Configure delays, limits, and account preferences</p>
        </div>
        <div className="actions">
          {error && <span style={{ color: '#E17055', fontSize: 13 }}>{error}</span>}
          {saved && <span style={{ color: '#00B894', fontSize: 13 }}>Saved!</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
            <Icon name="save" />{saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#636E72' }}>Loading settings…</div>
      ) : (
        <>
          <Section title="Anti-spam delays" desc="Random pauses between messages keep your number safe from rate limits.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Field label="Minimum delay" hint="Lower bound between messages">
                <Slider field="minDelaySec" value={settings.minDelaySec} min={3} max={120} suffix="sec" onChange={handleChange} />
              </Field>
              <Field label="Maximum delay" hint="Upper bound; randomised per message">
                <Slider field="maxDelaySec" value={settings.maxDelaySec} min={5} max={300} suffix="sec" color="#00CEC9" onChange={handleChange} />
              </Field>
              <Field label="Batch size" hint="Pause after every N messages">
                <Slider field="batchSize" value={settings.batchSize} min={1} max={200} suffix="msgs" onChange={handleChange} />
              </Field>
              <Field label="Batch pause" hint="Idle time between batches">
                <Slider field="batchPauseMin" value={settings.batchPauseMin} min={0} max={60} suffix="min" color="#00CEC9" onChange={handleChange} />
              </Field>
            </div>
            <Field label="Daily send limit">
              <Slider field="dailyLimit" value={settings.dailyLimit} min={1} max={10000} suffix="/day" onChange={handleChange} />
              <div className="text-sm text-gray" style={{ marginTop: 4 }}>Recommended: 800–1500 messages per day for established numbers.</div>
            </Field>
          </Section>
        </>
      )}
    </Shell>
  );
}
