import React, { useState, useEffect } from 'react';
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
  const [formErrors, setFormErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    return phone.length === 10 && /^[0-9]+$/.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let errors = { ...formErrors };

    if (name === 'phone') {
      // Strip any non-numeric characters
      newValue = value.replace(/[^0-9]/g, '');

      // Restrict to 10 digits
      if (newValue.length > 10) {
        newValue = newValue.slice(0, 10);
      }

      // Validate phone number
      if (newValue && !validatePhone(newValue)) {
        errors.phone = 'Phone number must be exactly 10 digits';
      } else {
        delete errors.phone;
      }
    }

    if (name === 'email') {
      if (value && !validateEmail(value)) {
        errors.email = 'Please enter a valid email address';
      } else {
        delete errors.email;
      }
    }

    if (name === 'password') {
      if (!value) {
        errors.password = 'Password must be filled';
      } else {
        delete errors.password;
      }

      if (form.confirmPassword && value !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      } else if (form.confirmPassword) {
        delete errors.confirmPassword;
      }
    }

    if (name === 'confirmPassword') {
      if (form.password && value !== form.password) {
        errors.confirmPassword = 'Passwords do not match';
      } else {
        delete errors.confirmPassword;
      }
    }

    setFormErrors(errors);
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check for form errors
    if (Object.keys(formErrors).length > 0) {
      setError('Please fix the errors in the form before submitting.');
      return;
    }

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate phone number
    if (!validatePhone(form.phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
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
                  {formErrors.email && <div className="input-error">{formErrors.email}</div>}
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
                    {formErrors.password && <div className="input-error">{formErrors.password}</div>}
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
                    {formErrors.confirmPassword && <div className="input-error">{formErrors.confirmPassword}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="phone-input-container">
                    <div className="phone-prefix">+90</div>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      inputMode="numeric"
                      placeholder="5XX XXX XXXX"
                      className="phone-input-with-prefix"
                    />
                  </div>
                  {formErrors.phone && <div className="input-error">{formErrors.phone}</div>}
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

                    <div className="form-row business-hours-row">
                      <div className="form-group business-time-group">
                        <label htmlFor="businessHoursStart">Opening Time</label>
                        <input
                          type="time"
                          id="businessHoursStart"
                          name="businessHoursStart"
                          value={form.businessHoursStart}
                          onChange={handleChange}
                          required
                          placeholder="Opening Hour (e.g. 09:00)"
                          className="business-time-input"
                        />
                      </div>

                      <div className="form-group business-time-group">
                        <label htmlFor="businessHoursEnd">Closing Time</label>
                        <input
                          type="time"
                          id="businessHoursEnd"
                          name="businessHoursEnd"
                          value={form.businessHoursEnd}
                          onChange={handleChange}
                          required
                          placeholder="Closing Hour (e.g. 22:00)"
                          className="business-time-input"
                        />
                      </div>
                    </div>

                    <div className="form-group cuisine-type-group">
                      <label htmlFor="cuisineType">Cuisine Type</label>
                      <input
                        type="text"
                        id="cuisineType"
                        name="cuisineType"
                        value={form.cuisineType}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Italian, Turkish"
                        className="cuisine-type-input"
                      />
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