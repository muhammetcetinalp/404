import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// This component prevents authenticated users from accessing auth pages
const AuthRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token) {
            setIsAuthenticated(true);
            setUserRole(role);
        }

        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    // If user is authenticated, redirect to their appropriate dashboard
    if (isAuthenticated) {
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (userRole === 'customer') {
            return <Navigate to="/customer-dashboard" replace />;
        } else if (userRole === 'restaurant_owner') {
            return <Navigate to="/restaurant-dashboard" replace />;
        } else if (userRole === 'courier') {
            return <Navigate to="/courier-dashboard" replace />;
        } else {
            return <Navigate to="/home" replace />;
        }
    } else {
        <Navigate to="/home" replace />;
    }

    // If user is not authenticated, show the auth page
    return children;
};

export default AuthRoute;