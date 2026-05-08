import Shell from '../components/Shell';
import Icon from '../components/Icon';

const CONTACTS = [
  { initials: 'AF', color: '#6C5CE7', name: 'Aroshi Fernando', num: '+94 77 ••• 2210', status: 'verified', group: 'Customers', groupColor: '#F0EDFF', groupText: '#6C5CE7' },
  { initials: 'DP', color: '#00CEC9', name: 'Dilshan Perera', num: '+94 71 ••• 9087', status: 'verified', group: 'VIP', groupColor: '#FFF8E1', groupText: '#B7841C' },
  { initials: 'MJ', color: '#A29BFE', name: 'Methuli Jayawardena', num: '+94 76 ••• 4421', status: 'pending', group: 'Newsletter', groupColor: '#E8F4FD', groupText: '#2D7DC2' },
  { initials: 'RS', color: '#E17055', name: 'Ravindu Silva', num: '+94 70 ••• 1130', status: 'failed', group: 'Customers', groupColor: '#F0EDFF', groupText: '#6C5CE7' },
  { initials: 'SW', color: '#74B9FF', name: 'Sanduni Wijesuriya', num: '+94 77 ••• 8821', status: 'verified', group: 'VIP', groupColor: '#FFF8E1', groupText: '#B7841C' },
  { initials: 'TB', color: '#FDCB6E', name: 'Tharindu Bandara', num: '+94 71 ••• 0942', status: 'verified', group: 'Newsletter', groupColor: '#E8F4FD', groupText: '#2D7DC2' },
  { initials: 'NK', color: '#00B894', name: 'Nethmi Kariyawasam', num: '+94 76 ••• 3340', status: 'verified', group: 'Customers', groupColor: '#F0EDFF', groupText: '#6C5CE7' },
  { initials: 'KH', color: '#A29BFE', name: 'Kavindu Hettiarachchi', num: '+94 77 ••• 5519', status: 'pending', group: 'Leads', groupColor: '#E6FFF5', groupText: '#00B894' },
  { initials: 'IL', color: '#E17055', name: 'Imasha Liyanage', num: '+94 70 ••• 8804', status: 'verified', group: 'Customers', groupColor: '#F0EDFF', groupText: '#6C5CE7' },
];

function StatusBadge({ status }) {
  if (status === 'verified') return <span className="badge badge-verified-green">Verified</span>;
  if (status === 'pending') return <span className="badge badge-pending">Pending</span>;
  return <span className="badge badge-failed">Not on app</span>;
}

export default function Contacts() {
  return (
    <Shell title="Contacts" sub="Manage your audience and contact groups">
      <div className="wa-page-head">
        <div>
          <h1>Contacts</h1>
          <p>12,304 total · 11,892 verified · 412 pending verification</p>
        </div>
        <div className="actions">
          <button className="btn btn-outline"><Icon name="upload" />Import CSV</button>
          <button className="btn btn-primary"><Icon name="plus" />Add contact</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="wa-search" style={{ width: 360, height: 40 }}>
          <Icon name="search" size={16} />
          <input placeholder="Search contacts by name or number…" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Verified', 'Pending', 'Failed'].map((t, i) => (
            <button key={t} className={'btn btn-sm ' + (i === 0 ? 'btn-primary' : 'btn-outline')}>{t}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm"><Icon name="filter" size={14} />Group</button>
        <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} />Export</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #DFE6E9', background: '#F0EDFF' }}>
          <div className="cb checked" />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6C5CE7' }}>3 selected</div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-sm btn-outline"><Icon name="check" size={14} />Verify</button>
          <button className="btn btn-sm btn-outline"><Icon name="send" size={14} />Send to selection</button>
          <button className="btn btn-sm" style={{ background: 'transparent', color: '#E17055', border: '1px solid #E17055' }}><Icon name="trash" size={14} />Delete</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 40 }}><div className="cb" style={{ borderColor: 'rgba(255,255,255,0.5)' }} /></th>
              <th>Name</th>
              <th>Number</th>
              <th>Status</th>
              <th>Group</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {CONTACTS.map((c, i) => (
              <tr key={i}>
                <td><div className={'cb' + (i < 3 ? ' checked' : '')} /></td>
                <td>
                  <div className="contact-cell">
                    <div className="contact-avatar" style={{ background: c.color }}>{c.initials}</div>
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td className="mono">{c.num}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <span style={{ background: c.groupColor, color: c.groupText, padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                    {c.group}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="wa-icon-btn" style={{ width: 30, height: 30 }}><Icon name="edit" size={14} /></button>
                    <button className="wa-icon-btn" style={{ width: 30, height: 30 }}><Icon name="trash" size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #DFE6E9', fontSize: 13, color: '#636E72' }}>
          <span>Showing 1–9 of 12,304 contacts</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="wa-icon-btn" style={{ width: 32, height: 32 }}><Icon name="chev" size={14} style={{ transform: 'rotate(90deg)' }} /></button>
            {[1, 2, 3, '…', 1367].map((p, i) => (
              <button key={i} className={'btn btn-sm ' + (p === 1 ? 'btn-primary' : 'btn-ghost')} style={{ minWidth: 32, padding: '0 10px' }}>{p}</button>
            ))}
            <button className="wa-icon-btn" style={{ width: 32, height: 32 }}><Icon name="chevR" size={14} /></button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
