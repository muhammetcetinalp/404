import React, { useState } from 'react';
import api from '../api';
import '../App.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forgot-password', { email });
      setMsg("📧 Please check your email to reset your password.");
    } catch (err) {
      setMsg("❌ Something went wrong. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>Forgot Your Password?</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default ForgotPasswordPage;
