import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import { startCheckout } from '../api/subscription';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: '$19/mo',
    description: 'For growing businesses',
    features: ['500 messages / day', '15,000 messages / month', 'Unlimited templates', 'Anti-ban pacing', 'Priority support'],
    cta: 'Choose Pro',
    highlight: false,
  },
  {
    id: 'proplus',
    name: 'Pro Plus',
    price: '$49/mo',
    description: 'For high-volume senders',
    features: ['1,500 messages / day', '50,000 messages / month', 'Everything in Pro', 'Faster support'],
    cta: 'Choose Pro Plus',
    highlight: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$99/mo',
    description: 'No practical limits',
    features: ['Unlimited daily sends', 'Unlimited monthly sends', 'Everything in Pro Plus', 'Dedicated support'],
    cta: 'Choose Unlimited',
    highlight: false,
  },
  {
    id: 'ultra',
    name: 'Ultra (API)',
    price: '$199/mo',
    description: 'API access for developers',
    features: ['Everything in Unlimited', 'REST API access', 'Programmatic sending', 'Integration support'],
    cta: 'Choose Ultra',
    highlight: false,
  },
];

export default function Pricing() {
  const { subscription, refresh } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  // Returning from Dodo checkout: refresh subscription state (webhook activates the plan).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      refresh();
      window.history.replaceState({}, '', '/pricing');
    }
  }, [refresh]);

  const handleSelect = async (planId) => {
    setLoading(planId);
    setError('');
    try {
      const { checkoutUrl } = await startCheckout(planId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl; // redirect to Dodo hosted checkout
      } else {
        setError('Could not start checkout. Please try again.');
      }
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
              {current === plan.id ? 'Current plan' : loading === plan.id ? 'Redirecting…' : plan.cta}
            </button>
          </div>
        ))}
      </div>
      {error && <p style={{ color: '#FF6B6B', marginTop: 16, textAlign: 'center' }}>{error}</p>}
    </Shell>
  );
}
