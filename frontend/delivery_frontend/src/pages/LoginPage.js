import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 🔁 error mesajını 5 saniye sonra otomatik temizle
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer); // bileşen unmount olursa temizle
    }
  }, [error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('role', res.data.role.toLowerCase());

      const role = res.data.role.toLowerCase();
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError(err.response.data); // Ban veya suspend mesajı
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="form-container" style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      backgroundColor: '#f8f8f8',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>

        {/* ⚠️ Uyarı mesajı görünür ve 5 saniye sonra kaybolur */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '10px'
          }}>
            {error}
          </div>
        )}
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>
          Don't have an account?{' '}
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/register')}>
            Register
          </span>
        </p>
        <p>
          Forgot your password?{' '}
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/forgot-password')}>
            Reset Password
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
