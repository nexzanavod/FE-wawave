import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import { selectPlan } from '../api/subscription';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: 'Free',
    description: 'Great for personal use and testing',
    features: ['100 messages / day', '1,000 messages / month', 'Basic templates', 'QR connect'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19/mo',
    description: 'For businesses that need more power',
    features: ['300 messages / day', '10,000 messages / month', 'Unlimited templates', 'Priority support', 'Stripe billing (coming soon)'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
];

export default function Pricing() {
  const { subscription, refresh } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handleSelect = async (planId) => {
    setLoading(planId);
    setError('');
    try {
      await selectPlan(planId);
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(null);
    }
  };

  const current = subscription?.plan;

  return (
    <Shell title="Choose a plan" sub="Upgrade or change your plan at any time" search={false}>
      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={'pricing-card' + (plan.highlight ? ' pricing-card--pro' : '')}>
            {plan.highlight && <div className="pricing-badge">Most popular</div>}
            <div className="pricing-name">{plan.name}</div>
            <div className="pricing-price">{plan.price}</div>
            <div className="pricing-desc">{plan.description}</div>
            <ul className="pricing-features">
              {plan.features.map((f) => (
                <li key={f}><span className="pricing-check">✓</span> {f}</li>
              ))}
            </ul>
            <button
              className={'pricing-btn' + (plan.highlight ? ' pricing-btn--pro' : '')}
              disabled={loading === plan.id || current === plan.id}
              onClick={() => handleSelect(plan.id)}
            >
              {current === plan.id ? 'Current plan' : loading === plan.id ? 'Saving…' : plan.cta}
            </button>
          </div>
        ))}
      </div>
      {error && <p style={{ color: '#FF6B6B', marginTop: 16, textAlign: 'center' }}>{error}</p>}
    </Shell>
  );
}
