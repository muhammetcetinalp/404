import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faUsers, faUtensils, faTruck,
    faUserShield, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import '../styles/admin.css';

const AdminLayout = ({ children, active }) => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="admin-sidebar">
            <nav className="admin-nav">
                <div className="admin-nav-header">
                    Dashboard
                </div>
                <button
                    className={`admin-nav-item ${active === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin')}
                >
                    <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" /> Overview
                </button>
                <button
                    className={`admin-nav-item ${active === 'customers' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/customers')}
                >
                    <FontAwesomeIcon icon={faUsers} className="nav-icon" /> Customers
                </button>
                <button
                    className={`admin-nav-item ${active === 'restaurants' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/restaurants')}
                >
                    <FontAwesomeIcon icon={faUtensils} className="nav-icon" /> Restaurants
                </button>
                <button
                    className={`admin-nav-item ${active === 'couriers' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/couriers')}
                >
                    <FontAwesomeIcon icon={faTruck} className="nav-icon" /> Couriers
                </button>
                <button
                    className={`admin-nav-item ${active === 'admins' ? 'active' : ''}`}
                    onClick={() => handleNavigate('/admin/admin-users')}
                >
                    <FontAwesomeIcon icon={faUserShield} className="nav-icon" /> Admins
                </button>
            </nav>
        </div>
    );
};

export default AdminLayout;