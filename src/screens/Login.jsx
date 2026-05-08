import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api/auth';
import { useAuth } from '../context/AuthContext';

function WaveLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8L6 14L9 6L12 16L15 6L18 14L21 8" />
    </svg>
  );
}

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(email, password);
        signIn(data.accessToken, data.user);
        navigate('/');
      } else {
        const data = await signup(email, password);
        if (data.session) {
          signIn(data.session.access_token, data.user);
          navigate('/');
        } else {
          setMode('login');
          setError('Account created — confirm your email then sign in.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #F0EDFF 0%, #E8F4FD 100%)' }}>
      <div style={{ width: 400, background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 8px 40px rgba(108,92,231,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(180deg, #6C5CE7, #4834D4)', display: 'grid', placeItems: 'center' }}>
            <WaveLogo />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>WAWave</div>
            <div style={{ fontSize: 12, color: '#636E72' }}>Ride the messaging wave</div>
          </div>
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#636E72' }}>
          {mode === 'login' ? 'Sign in to your WAWave account' : 'Get started with WhatsApp bulk messaging'}
        </p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background: '#FFE9E4', color: '#E17055', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', height: 46, fontSize: 15, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#636E72' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={{ color: '#6C5CE7', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
}
