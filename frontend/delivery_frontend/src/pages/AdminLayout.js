import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const AdminLayout = ({ children, active }) => {
    const navigate = useNavigate();

    // Get admin name from localStorage and display first initial and name
    // Şöyle değiştirmelisiniz:
    const storedName = localStorage.getItem('name');
    const adminName = (storedName && storedName !== "undefined") ? storedName : "Admin"; const adminInitial = adminName.charAt(0).toUpperCase();

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="admin-sidebar">
            <div className="admin-profile">
                <div className="admin-avatar">
                    <span>{adminInitial}</span>
                </div>
                <div className="admin-info">
                    <h3>{adminName}</h3>
                    <p>{localStorage.getItem('email') || 'admin@example.com'}</p>
                </div>
            </div>

            <nav className="admin-nav">
                <button
                    className={`admin-nav-item ${active === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin')}
                >
                    <i className="nav-icon dashboard-icon"></i> Dashboard
                </button>
                <button
                    className={`admin-nav-item ${active === 'customers' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/customers')}
                >
                    <i className="nav-icon users-icon"></i> Customers
                </button>
                <button
                    className={`admin-nav-item ${active === 'restaurants' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/restaurants')}
                >
                    <i className="nav-icon restaurants-icon"></i> Restaurants
                </button>
                <button
                    className={`admin-nav-item ${active === 'couriers' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/couriers')}
                >
                    <i className="nav-icon couriers-icon"></i> Couriers
                </button>
                <button
                    className={`admin-nav-item ${active === 'admins' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/admin-users')}
                >
                    <i className="nav-icon admin-icon"></i> Admins
                </button>
                <button
                    className={`admin-nav-item ${active === 'orders' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/orders')}
                >
                    <i className="nav-icon orders-icon"></i> Orders
                </button>
                <button
                    className={`admin-nav-item ${active === 'settings' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/settings')}
                >
                    <i className="nav-icon settings-icon"></i> Settings
                </button>
            </nav>

            <div className="admin-sidebar-footer">
                <button className="logout-button" onClick={handleLogout}>
                    <i className="logout-icon"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default AdminLayout;