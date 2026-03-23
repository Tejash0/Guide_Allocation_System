import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.js';
import AuthLayout from './AuthLayout.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.ok) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="auth-field-anim" style={{ animationDelay: '0.15s', marginBottom: 36 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: '#a0998f', marginBottom: 10,
        }}>
          Guide Allocation System
        </div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '2.5rem', fontWeight: 600,
          color: '#0d1b2a', lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          Welcome back
        </h1>
        <p style={{ marginTop: 8, fontSize: '0.875rem', color: '#6b7280', fontWeight: 400 }}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="auth-field-anim" style={{
          animationDelay: '0s',
          background: '#fee2e2', color: '#991b1b',
          padding: '10px 14px', borderRadius: 8,
          fontSize: '0.825rem', marginBottom: 20,
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field-anim" style={{ animationDelay: '0.2s', marginBottom: 24 }}>
          <label htmlFor="login-email" style={labelStyle}>Email address</label>
          <input
            id="login-email"
            className="auth-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@university.edu"
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-field-anim" style={{ animationDelay: '0.27s', marginBottom: 32 }}>
          <label htmlFor="login-password" style={labelStyle}>Password</label>
          <input
            id="login-password"
            className="auth-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="auth-field-anim" style={{ animationDelay: '0.34s' }}>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Links */}
      <div className="auth-field-anim" style={{
        animationDelay: '0.41s',
        marginTop: 28,
        paddingTop: 24,
        borderTop: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column', gap: 10,
        fontSize: '0.85rem', color: '#6b7280',
      }}>
        <div>
          New student?{' '}
          <Link to="/register/student" className="auth-link">Create student account</Link>
        </div>
        <div>
          Faculty member?{' '}
          <Link to="/register/faculty" className="auth-link">Register as faculty</Link>
        </div>
      </div>
    </AuthLayout>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#a0998f',
  marginBottom: 6,
};
