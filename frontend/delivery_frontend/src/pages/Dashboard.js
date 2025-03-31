import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="form-container">
      <h1>Dashboard</h1>
      <p>Welcome, <strong>{email}</strong> ({role})</p>

      <button
        onClick={() => navigate('/profile')}
        style={{
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          marginTop: '15px',
          width: '100%'
        }}
      >
        Edit Profile
      </button>

      <button
        onClick={handleLogout}
        style={{
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          marginTop: '15px',
          width: '100%'
        }}
      >
        Logout
      </button>

      <Link to="/restaurant/menu">
        <button className="btn btn-success">Go to Menu</button>
      </Link>


    </div>
  );
};

export default Dashboard;
