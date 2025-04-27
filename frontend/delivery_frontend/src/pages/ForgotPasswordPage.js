import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/login.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mesajı 5 saniye sonra otomatik temizle
  useEffect(() => {
    if (msg || error) {
      const timer = setTimeout(() => {
        setMsg('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer); // bileşen unmount olursa temizle
    }
  }, [msg, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forgot-password', { email });
      setMsg("Please check your email to reset your password.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
                <h1 className="login-title">Forgot Password</h1>
                <p className="login-subtitle">Enter your email to reset your password</p>

                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}

                {msg && (
                  <div className="login-success" style={{
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderLeft: '4px solid #28a745',
                    color: '#28a745',
                    padding: '10px 15px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {msg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <button type="submit" className="login-button">
                    Send Reset Link
                  </button>
                </form>

                <div className="register-link">
                  <p>
                    Remember your password?{' '}
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      navigate('/login');
                    }}>
                      Back to login
                    </a>
                  </p>
                </div>
              </div>

              {/* Image Side */}
              <div className="login-image-side">
                <div className="login-image-content">
                  <h2>Password Recovery</h2>
                  <p>
                    Don't worry! It happens to the best of us. Enter your email and we'll send you a link to reset your password.
                  </p>

                  <div className="benefits">
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Secure password reset process</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Quick and easy recovery</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Get back to ordering in minutes</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>24/7 customer support</span>
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

export default ForgotPasswordPage;