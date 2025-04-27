import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/login.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/resetPassword/${token}`)
      .then(res => {
        setEmail(res.data.email);
      })
      .catch(() => {
        setError("Reset link expired or invalid.");
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      await api.post('/resetPassword', {
        email,
        password: form.password
      });
      setSuccess("Password successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError("Failed to reset password.");
    }
  };

  return (
    <div className="login-page-wrapper login-back1">
      <Header />
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-content">
              {/* Form Side */}
              <div className="login-form-side">
                <h1 className="login-title">Reset Password</h1>
                <p className="login-subtitle">Enter your new password below</p>

                {error && (
                  <div className="login-error">{error}</div>
                )}

                {success && (
                  <div className="login-success" style={{
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderLeft: '4px solid #28a745',
                    color: '#28a745',
                    padding: '10px 15px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {success}
                  </div>
                )}

                {email && (
                  <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        required
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        required
                        value={form.confirmPassword}
                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="login-button">Reset Password</button>
                  </form>
                )}
              </div>

              {/* Image Side */}
              <div className="login-image-side">
                <div className="login-image-content">
                  <h2>Password Recovery</h2>
                  <p>
                    Please choose a strong and secure password that you haven't used before.
                  </p>
                  <div className="benefits">
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Secure and encrypted</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Fast recovery process</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>24/7 Support available</span>
                    </div>
                  </div>

                  <button className="register-button-alt" onClick={() => navigate('/register')}>
                    Create Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;