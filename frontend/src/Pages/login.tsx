import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
    <div className="login-container">
      <section className="panel-card login-card">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Authentication</p>
            <h2>LEMF SYSTEM LOGIN</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />

          <label htmlFor="password" style={{ marginTop: '12px' }}>
            Password
          </label>
          <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {error && <p className="hint error-text" style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
            style={{ marginTop: '20px', width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  );
}
