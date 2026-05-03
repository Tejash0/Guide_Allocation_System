import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { registerStudent } from '../api/auth.js';
import AuthLayout from './AuthLayout.jsx';

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#a0998f',
  marginBottom: 6,
};

export default function StudentRegister() {
  const [form, setForm] = useState({ name: '', email: '', student_id: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem('token')) return <Navigate to="/dashboard" replace />;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.student_id.trim()) errs.student_id = 'Student ID is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (!form.confirm_password) errs.confirm_password = 'Please confirm your password';
    else if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setServerError('');
    setLoading(true);
    const { name, email, student_id, password } = form;
    const result = await registerStudent({ name, email, student_id, password });
    setLoading(false);
    if (result.ok) setSuccess(true);
    else setServerError(result.error || 'Registration failed');
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="auth-field-anim" style={{ animationDelay: '0.1s', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 24px',
            background: 'rgba(201,168,76,0.12)',
            border: '2px solid rgba(201,168,76,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: '#c9a84c',
          }}>✓</div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '2rem', fontWeight: 600, color: '#0d1b2a', marginBottom: 10,
          }}>Account Created</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 28 }}>
            Your student account has been successfully created. You can now sign in and start exploring available guides.
          </p>
          <Link to="/login">
            <button className="auth-submit" style={{ width: '100%' }}>
              Proceed to Sign In
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const fields = [
    { name: 'name',             label: 'Full Name',       type: 'text',     placeholder: 'John Doe',           delay: '0.2s'  },
    { name: 'email',            label: 'Email Address',   type: 'email',    placeholder: 'john@university.edu', delay: '0.26s' },
    { name: 'student_id',       label: 'Student ID',      type: 'text',     placeholder: 'STU2024001',         delay: '0.32s' },
    { name: 'password',         label: 'Password',        type: 'password', placeholder: '••••••••',           delay: '0.38s' },
    { name: 'confirm_password', label: 'Confirm Password',type: 'password', placeholder: '••••••••',           delay: '0.44s' },
  ];

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="auth-field-anim" style={{ animationDelay: '0.15s', marginBottom: 32 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: '#a0998f', marginBottom: 10,
        }}>Student Registration</div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '2.2rem', fontWeight: 600,
          color: '#0d1b2a', lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          Create your account
        </h1>
        <p style={{ marginTop: 8, fontSize: '0.875rem', color: '#6b7280' }}>
          Already registered?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div style={{
          background: '#fee2e2', color: '#991b1b',
          padding: '10px 14px', borderRadius: 8,
          fontSize: '0.825rem', marginBottom: 20,
          border: '1px solid rgba(239,68,68,0.2)',
        }}>{serverError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {fields.map(({ name, label, type, placeholder, delay }) => (
          <div
            key={name}
            className="auth-field-anim"
            style={{ animationDelay: delay, marginBottom: errors[name] ? 18 : 22 }}
          >
            <label htmlFor={`sr-${name}`} style={labelStyle}>{label}</label>
            <input
              id={`sr-${name}`}
              className={`auth-input${errors[name] ? ' has-error' : ''}`}
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              autoComplete={type === 'password' ? 'new-password' : name}
            />
            {errors[name] && (
              <span style={{ display: 'block', color: '#c0392b', fontSize: '0.75rem', marginTop: 5, fontWeight: 500 }}>
                {errors[name]}
              </span>
            )}
          </div>
        ))}

        <div className="auth-field-anim" style={{ animationDelay: '0.5s', marginTop: 8 }}>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </div>
      </form>

      <div className="auth-field-anim" style={{
        animationDelay: '0.56s',
        marginTop: 24, paddingTop: 20,
        borderTop: '1px solid rgba(0,0,0,0.07)',
        fontSize: '0.8rem', color: '#a0998f', textAlign: 'center',
      }}>
        Faculty member?{' '}
        <Link to="/register/faculty" className="auth-link">Register here</Link>
      </div>
    </AuthLayout>
  );
}
