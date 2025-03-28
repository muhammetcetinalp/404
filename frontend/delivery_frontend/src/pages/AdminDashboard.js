import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleViewUsers = () => {
        navigate('/admin/users');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '40px', textAlign: 'center' }}>
            <h2>Admin Dashboard</h2>

            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={handleViewUsers}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    View All Users
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
