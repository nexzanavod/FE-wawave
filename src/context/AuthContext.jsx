import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await getMe();
      setUser(data.user);
      setSubscription(data.subscription);
      setUsage(data.usage);
    } catch (err) {
      if (err.response?.status === 401) localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signIn = async (accessToken, userData) => {
    localStorage.setItem('token', accessToken);
    setUser(userData);
    try {
      const data = await getMe();
      setUser(data.user);
      setSubscription(data.subscription);
      setUsage(data.usage);
    } catch { /* keep basic user; refresh will retry */ }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('waStatus');
    setUser(null);
    setSubscription(null);
    setUsage(null);
  };

  return (
    <AuthContext.Provider value={{ user, subscription, usage, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
