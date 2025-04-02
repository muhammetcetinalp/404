import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/login.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('role', res.data.role.toLowerCase());

      const role = res.data.role.toLowerCase();
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'customer') {
        navigate('/customer-dashboard');
      } else if (role === 'restaurant_owner') {
        navigate('/restaurant-dashboard');
      } else if (role === 'courier') {
        navigate('/courier-dashboard');
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError(err.response.data);
      } else {
        setError('Login failed. Please check your credentials.');
      }
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
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Sign in to your account to continue</p>

                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="forgot-password">
                    <span onClick={() => navigate('/forgot-password')}>
                      Forgot Password?
                    </span>
                  </div>

                  <button type="submit" className="login-button">
                    Sign In
                  </button>
                </form>

                <div className="register-link">
                  <p>
                    Don't have an account?{' '}
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      navigate('/register');
                    }}>
                      Create an account
                    </a>
                  </p>
                </div>
              </div>

              {/* Image Side */}
              <div className="login-image-side">
                <div className="login-image-content">
                  <h2>Hungry? We've got you covered.</h2>
                  <p>
                    Login to access your favorite meals, track your orders, and enjoy
                    a seamless food delivery experience.
                  </p>

                  <div className="benefits">
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Fast and secure ordering</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Track your orders in real-time</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Save your favorite restaurants</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Special offers and discounts</span>
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

export default LoginPage;