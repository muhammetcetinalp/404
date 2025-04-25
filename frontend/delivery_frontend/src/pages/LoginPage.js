import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/login.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL'den banned parametresini kontrol et
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('error') === 'banned') {
      setError('Your account has been banned. Please contact the administrator for assistance.');
    }
  }, [location]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Only clear error when user modifies fields
    if (error) {
      setError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    console.log('Form submission prevented');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(''); // Clear any previous errors

    try {
      // Call login API
      const res = await api.post('/login', form);

      // If successful, store data and navigate
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('role', res.data.role.toLowerCase());
      localStorage.setItem('accountStatus', res.data.accountStatus || 'ACTIVE');

      // Navigate based on role
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
      console.error("Login error:", err);

      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message || 'Login failed. Please try again.'
      );

      // Important: Don't redirect or refresh here
    } finally {
      setIsSubmitting(false);
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
                  <div className="login-error-container">
                    <div className="login-error">
                      {error}
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="login-form" noValidate>
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
                    <Link to="/forgot-password">Forgot Password?</Link>
                  </div>

                  <button
                    type="submit"
                    className="login-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                <div className="register-link">
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register">Create an account</Link>
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

                  <Link to="/register" className="register-button-alt">
                    Create Account
                  </Link>
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