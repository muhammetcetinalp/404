import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import '../App.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');

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
      window.location.href = "/login";
    } catch (err) {
      setError("Failed to reset password.");
    }
  };

  return (
    <div className="form-container">
      <h2>Reset Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {email && (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            required
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
