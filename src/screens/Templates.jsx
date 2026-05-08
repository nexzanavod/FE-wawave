import Shell from '../components/Shell';
import Icon from '../components/Icon';

const TEMPLATES = [
  { name: 'Order shipped notification', type: 'Text', preview: 'Hi {name} 👋 Your order #{order_id} has been shipped! Track it here: wawave.app/t/{tracking}', uses: 1284, color: '#6C5CE7', updated: '2 days ago' },
  { name: 'Appointment reminder', type: 'Text', preview: 'Hi {name}, this is a reminder for your appointment on {date} at {time}. Reply YES to confirm.', uses: 892, color: '#00CEC9', updated: '5 days ago' },
  { name: 'Weekend promo blast', type: 'Image', preview: 'Hi {name}! Our weekend offer ends tonight. Get 25% off everything with code WAVE25.', uses: 432, color: '#A29BFE', updated: '1 week ago' },
  { name: 'Invoice ready', type: 'Text', preview: 'Hi {name}, your invoice #{invoice_id} is ready. View and pay at wawave.app/i/{token}.', uses: 778, color: '#FDCB6E', updated: '2 weeks ago' },
  { name: 'Welcome onboarding', type: 'Image', preview: "Welcome to the family, {name}! Here's a quick guide to get you started.", uses: 209, color: '#74B9FF', updated: '3 weeks ago' },
  { name: 'Re-engagement nudge', type: 'Text', preview: "Hey {name}, we miss you! Here's 15% off to bring you back: WELCOME15.", uses: 154, color: '#E17055', updated: '1 month ago' },
];

function TemplateCard({ t }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ height: 6, background: t.color }} />
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span className={'badge ' + (t.type === 'Image' ? 'badge-verified' : 'badge-violet') + ' badge-no-dot'}>
            {t.type === 'Image'
              ? <><Icon name="image" size={10} />Image + caption</>
              : <><Icon name="file" size={10} />Text only</>}
          </span>
          <button className="wa-icon-btn" style={{ width: 28, height: 28, border: 'none' }}><Icon name="more" size={14} /></button>
        </div>
        <h4 style={{ margin: '6px 0 8px', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{t.name}</h4>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#636E72', lineHeight: 1.5, height: 54, overflow: 'hidden' }}>
          {t.preview}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #DFE6E9', fontSize: 11, color: '#636E72' }}>
          <span><span className="text-mono" style={{ fontWeight: 600, color: '#2D3436' }}>{t.uses.toLocaleString()}</span> uses</span>
          <span>Updated {t.updated}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button className="btn btn-sm btn-outline" style={{ flex: 1 }}><Icon name="edit" size={12} />Edit</button>
          <button className="btn btn-sm btn-accent" style={{ flex: 1 }}><Icon name="send" size={12} />Use</button>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const totalUses = TEMPLATES.reduce((s, t) => s + t.uses, 0);
  return (
    <Shell title="Templates" sub="Reusable message templates with variables">
      <div className="wa-page-head">
        <div>
          <h1>Templates</h1>
          <p>{TEMPLATES.length} templates · {totalUses.toLocaleString()} total uses this month</p>
        </div>
        <div className="actions">
          <button className="btn btn-outline"><Icon name="copy" />Duplicate</button>
          <button className="btn btn-primary"><Icon name="plus" />New template</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div className="wa-search" style={{ width: 320, height: 40 }}>
          <Icon name="search" size={16} />
          <input placeholder="Search templates…" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Text', 'Image', 'Most used', 'Recent'].map((t, i) => (
            <button key={t} className={'btn btn-sm ' + (i === 0 ? 'btn-primary' : 'btn-ghost')}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {TEMPLATES.map((t, i) => <TemplateCard key={i} t={t} />)}
        <div style={{ border: '2px dashed #A29BFE', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, color: '#6C5CE7', cursor: 'pointer', background: 'rgba(108,92,231,0.02)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F0EDFF', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
            <Icon name="plus" size={26} stroke="#6C5CE7" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Create template</div>
          <div className="text-sm text-gray" style={{ textAlign: 'center', maxWidth: 200 }}>Save a message with variables to reuse across campaigns</div>
        </div>
      </div>
    </Shell>
  );
}
