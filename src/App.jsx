import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import QrConnect from './screens/QrConnect';
import Contacts from './screens/Contacts';
import VerifyNumbers from './screens/VerifyNumbers';
import SendMessages from './screens/SendMessages';
import Templates from './screens/Templates';
import MessageLogs from './screens/MessageLogs';
import Settings from './screens/Settings';
import Pricing from './screens/Pricing';
import Jobs from './screens/Jobs';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#636E72' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/qr" element={<PrivateRoute><QrConnect /></PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
      <Route path="/verify" element={<PrivateRoute><VerifyNumbers /></PrivateRoute>} />
      <Route path="/send" element={<PrivateRoute><SendMessages /></PrivateRoute>} />
      <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
      <Route path="/logs" element={<PrivateRoute><MessageLogs /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/pricing" element={<PrivateRoute><Pricing /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
