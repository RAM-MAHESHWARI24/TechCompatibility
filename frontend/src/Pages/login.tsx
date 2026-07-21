import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid username or password.');
      }
    } catch {
      setError('An error occurred. Check your server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="govt-login-page">
      {/* Top Header Bar */}
      <header className="govt-header">
        <div className="govt-header-left">
          <div className="govt-emblem">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="rgba(255,255,255,0.1)" />
              <text x="18" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">⚙</text>
            </svg>
          </div>
          <div className="govt-header-text">
            <span className="govt-dept-sub">Government of India</span>
            <span className="govt-dept-sub">Ministry of Communications, Department</span>
            <span className="govt-dept-sub">of Telecommunications</span>
          </div>
          <h1 className="govt-header-title">Ministry of Communications, Department of Telecommunications</h1>
        </div>
        <div className="govt-flag">
          <div className="flag-stripe flag-saffron"></div>
          <div className="flag-stripe flag-white">
            <div className="flag-chakra"></div>
          </div>
          <div className="flag-stripe flag-green"></div>
        </div>
      </header>

      {/* Divider Line */}
      <div className="govt-divider"></div>

      {/* Login Card */}
      <main className="govt-login-main">
        <div className="govt-login-card">
          <h1 className="govt-card-title">Login</h1>
          <p className="govt-card-subtitle">Access the System</p>

          <form onSubmit={handleSubmit} className="govt-login-form">
            <div className="govt-field-group">
              <label htmlFor="username" className="govt-label">Username</label>
              <div className="govt-input-wrapper">
                <FaUser className="govt-input-icon" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your official ID"
                  required
                  className="govt-input"
                />
              </div>
            </div>

            <div className="govt-field-group">
              <div className="govt-label-row">
                <label htmlFor="password" className="govt-label">Password</label>
                <a href="#" className="govt-forgot-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
              <div className="govt-input-wrapper">
                <FaLock className="govt-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="govt-input govt-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="govt-eye-btn"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="govt-error-text">{error}</p>}

            <button
              className="govt-signin-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : (
                <>Sign In &nbsp;<FaSignInAlt size={16} /></>
              )}
            </button>
          </form>

          <div className="govt-notice-divider"></div>
          <p className="govt-notice">
            Authorized personnel only. All access and activity on this system<br />
            is monitored and recorded.
          </p>
        </div>

        <p className="govt-support-text">
          Having trouble? <a href="#" className="govt-support-link" onClick={(e) => e.preventDefault()}>Contact Technical Support</a>
        </p>
      </main>
    </div>
  );
}
