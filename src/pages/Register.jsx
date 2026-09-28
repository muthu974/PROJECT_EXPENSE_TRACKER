import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register({ onSwitch, showToast }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { level: 1, label: 'Weak' };
    if (score <= 3) return { level: 2, label: 'Fair' };
    return { level: 3, label: 'Strong' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim();

    if (!cleanName || !cleanEmail || !form.password || !form.confirm) {
      setError('Please fill in all fields');
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const result = await register(cleanName, cleanEmail, form.password);
      if (!result.success) {
        setError(result.message || 'Registration failed');
        showToast(result.message || 'Registration failed', 'error');
      } else {
        showToast('Account created! Welcome 🎉', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">💰</div>
          <h2>ExpenseTracker</h2>
          <p>Personal Finance Manager</p>
        </div>

        <div className="auth-header">
          <h1>Create account</h1>
          <p>Start tracking your finances today</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>❌</span> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="reg-name">Full name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  <div className={`strength-bar ${strength.level >= 1 ? `level-${strength.level}` : ''}`} />
                  <div className={`strength-bar ${strength.level >= 2 ? `level-${strength.level}` : ''}`} />
                  <div className={`strength-bar ${strength.level >= 3 ? `level-${strength.level}` : ''}`} />
                </div>
                <span className={`strength-label level-text-${strength.level}`}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="reg-confirm">Confirm password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔐</span>
              <input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
              {form.confirm && (
                <span className="auth-match-icon">
                  {form.password === form.confirm ? '✅' : '❌'}
                </span>
              )}
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner spinner-sm" /> Creating account...</>
            ) : (
              '→ Create Account'
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={onSwitch} disabled={loading}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
