import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { registerFaculty } from '../api/auth.js';
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

export default function FacultyRegister() {
  const [form, setForm] = useState({ name: '', email: '', department: '', domain: '', password: '', confirm_password: '' });
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
    if (!form.department.trim()) errs.department = 'Department is required';
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
    const { name, email, department, domain, password } = form;
    const result = await registerFaculty({ name, email, department, domain, password });
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
          }}>⧗</div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '2rem', fontWeight: 600, color: '#0d1b2a', marginBottom: 10,
          }}>Registration Submitted</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16 }}>
            Your account is pending admin approval. <strong>You will not be able to log in until an admin approves your account.</strong>
          </p>

          {/* What happens next — left-aligned list inside a card */}
          <div style={{
            background: 'rgba(201,168,76,0.07)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 10, padding: '14px 18px',
            textAlign: 'left', marginBottom: 28,
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 10 }}>What happens next</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'An admin reviews your registration',
                'You receive an in-app notification once approved',
                'You can then sign in and appear in the guides list',
              ].map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.82rem', color: '#5a4e2f' }}>
                  <span style={{ color: '#c9a84c', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <Link to="/login">
            <button className="auth-submit" style={{ width: '100%' }}>
              Back to Sign In
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const fields = [
    { name: 'name',             label: 'Full Name',          type: 'text',     placeholder: 'Dr. Jane Smith',        delay: '0.2s',  required: true  },
    { name: 'email',            label: 'Email Address',      type: 'email',    placeholder: 'jane@university.edu',   delay: '0.26s', required: true  },
    { name: 'department',       label: 'Department',         type: 'text',     placeholder: 'Computer Science',      delay: '0.32s', required: true  },
    { name: 'domain',           label: 'Domain / Expertise', type: 'text',     placeholder: 'Machine Learning (optional)', delay: '0.38s', required: false },
    { name: 'password',         label: 'Password',           type: 'password', placeholder: '••••••••',              delay: '0.44s', required: true  },
    { name: 'confirm_password', label: 'Confirm Password',   type: 'password', placeholder: '••••••••',              delay: '0.5s',  required: true  },
  ];

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="auth-field-anim" style={{ animationDelay: '0.15s', marginBottom: 28 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: '#a0998f', marginBottom: 10,
        }}>Faculty Registration</div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '2.2rem', fontWeight: 600,
          color: '#0d1b2a', lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>
          Join as faculty
        </h1>
        <p style={{ marginTop: 8, fontSize: '0.875rem', color: '#6b7280' }}>
          Already registered?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      {/* Pending approval notice */}
      <div className="auth-field-anim" style={{
        animationDelay: '0.18s',
        display: 'flex', gap: 10, alignItems: 'flex-start',
        background: 'rgba(201,168,76,0.08)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 8, padding: '10px 14px',
        marginBottom: 24,
      }}>
        <span style={{ color: '#c9a84c', fontSize: '0.75rem', marginTop: 1, flexShrink: 0 }}>ⓘ</span>
        <span style={{ fontSize: '0.78rem', color: '#7a6a40', lineHeight: 1.5 }}>
          Faculty accounts require admin approval before activation. You'll be notified once reviewed.
        </span>
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
        {fields.map(({ name, label, type, placeholder, delay, required }) => (
          <div
            key={name}
            className="auth-field-anim"
            style={{ animationDelay: delay, marginBottom: errors[name] ? 16 : 20 }}
          >
            <label htmlFor={`fr-${name}`} style={labelStyle}>
              {label}
              {!required && (
                <span style={{ fontWeight: 400, fontSize: '0.68rem', marginLeft: 6, color: '#b5aea6', textTransform: 'none', letterSpacing: 0 }}>
                  optional
                </span>
              )}
            </label>
            <input
              id={`fr-${name}`}
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

        <div className="auth-field-anim" style={{ animationDelay: '0.56s', marginTop: 8 }}>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>

      <div className="auth-field-anim" style={{
        animationDelay: '0.62s',
        marginTop: 24, paddingTop: 20,
        borderTop: '1px solid rgba(0,0,0,0.07)',
        fontSize: '0.8rem', color: '#a0998f', textAlign: 'center',
      }}>
        Registering as a student?{' '}
        <Link to="/register/student" className="auth-link">Student registration</Link>
      </div>
    </AuthLayout>
  );
}
