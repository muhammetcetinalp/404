import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/register.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    city: '',
    district: '',
    address: '',
    businessHoursStart: '',
    businessHoursEnd: '',
    cuisineType: '',
    deliveryType: 'DELIVERY'
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For phone field, only allow numeric values
    if (name === 'phone' && value !== '') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return; // Stop here and don't proceed with API call
    }

    setIsSubmitting(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;

      // Make API call
      const response = await api.post('/register', payload);

      // Only navigate to login if registration is successful
      if (response && response.status === 200) {
        navigate('/login');
      }
    } catch (err) {
      // Show error and DON'T navigate
      console.error("Registration error:", err);
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneKeyPress = (e) => {
    // Allow only numeric input for phone field
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <div className="register-page register-back1">
      <Header />

      <div className="register-container">
        <div className="register-card">
          <div className="register-content">
            <div className="register-form-side">
              <h1 className="register-title">Create Account</h1>
              <p className="register-subtitle">Please fill in your details to get started</p>

              {error && (
                <div className="register-error-container">
                  <div className="register-error">{error}</div>
                </div>
              )}

              <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onKeyDown={handlePhoneKeyPress}
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">I am a</label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="customer">Customer</option>
                    <option value="courier">Courier</option>
                    <option value="restaurant_owner">Restaurant Owner</option>
                  </select>
                </div>

                {(form.role === 'customer' || form.role === 'restaurant_owner') && (
                  <div className="address-section">
                    <h3 className="section-title">Address Information</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="district">District</label>
                        <input
                          id="district"
                          name="district"
                          value={form.district}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Full Address</label>
                      <textarea
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {form.role === 'restaurant_owner' && (
                  <div className="business-section">
                    <h3 className="section-title">Business Hours</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="businessHoursStart">Opening Time</label>
                        <input
                          type="time"
                          id="businessHoursStart"
                          name="businessHoursStart"
                          value={form.businessHoursStart}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="businessHoursEnd">Closing Time</label>
                        <input
                          type="time"
                          id="businessHoursEnd"
                          name="businessHoursEnd"
                          value={form.businessHoursEnd}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cuisineType">Cuisine Type</label>
                        <input
                          type="text"
                          id="cuisineType"
                          name="cuisineType"
                          value={form.cuisineType}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="deliveryType">Delivery Type</label>
                        <select
                          id="deliveryType"
                          name="deliveryType"
                          value={form.deliveryType}
                          onChange={handleChange}
                          required
                        >
                          <option value="DELIVERY">Delivery</option>
                          <option value="PICKUP">Pickup</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="register-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="login-link">
                Already have an account? <Link to="/login">Sign In</Link>
              </div>
            </div>

            <div className="register-image-side">
              <div className="register-image-content">
                <h2>Welcome to our platform!</h2>
                <p>Join our community and enjoy the benefits of our food delivery service.</p>

                <button
                  className="login-button"
                  onClick={() => navigate('/login')}
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;