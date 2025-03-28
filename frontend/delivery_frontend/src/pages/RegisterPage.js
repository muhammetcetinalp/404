import React, { useState } from 'react';
import api from '../api';
import '../App.css';

const RegisterPage = () => {
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
    businessHoursEnd: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const payload = { ...form };
      delete payload.confirmPassword;

      await api.post('/register', payload);
      window.location.href = '/login';
    } catch (err) {
      setError('Registration failed. Please check your information.');
    }
  };

  const inputStyle = {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
    width: '100%'
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={inputStyle} />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required style={inputStyle} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required style={inputStyle} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required style={inputStyle} />

        <select name="role" value={form.role} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Role</option>
          <option value="customer">Customer</option>
          <option value="courier">Courier</option>
          <option value="restaurant_owner">Restaurant Owner</option>
        </select>

        {(form.role === 'customer' || form.role === 'restaurant_owner') && (
          <>
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} required style={inputStyle} />
            <input name="district" placeholder="District" value={form.district} onChange={handleChange} required style={inputStyle} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required style={inputStyle} />
          </>
        )}

        {form.role === 'restaurant_owner' && (
          <>
            <input name="businessHoursStart" placeholder="Opening Hour" value={form.businessHoursStart} onChange={handleChange} required style={inputStyle} />
            <input name="businessHoursEnd" placeholder="Closing Hour" value={form.businessHoursEnd} onChange={handleChange} required style={inputStyle} />
          </>
        )}

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <button type="submit" style={{
          padding: '12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Register
        </button>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <p>Already have an account?{' '}
            <span
              onClick={() => window.location.href = '/login'}
              style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
