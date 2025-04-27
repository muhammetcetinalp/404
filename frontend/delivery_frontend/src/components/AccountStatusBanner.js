import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import api from '../api';

// Account Status Banner Component
const AccountStatusBanner = () => {
    const [accountStatus, setAccountStatus] = useState(localStorage.getItem('accountStatus') || 'ACTIVE');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await api.get('/profile');

                if (response.data && response.data.profile && response.data.profile.accountStatus) {
                    setAccountStatus(response.data.profile.accountStatus);
                    localStorage.setItem('accountStatus', response.data.profile.accountStatus);
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        };

        fetchUserProfile();
    }, []);

    if (accountStatus === 'SUSPENDED') {
        return (
            <div className="account-status-banner suspended">
                <div className="container">
                    <div className="alert alert-warning">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        <strong>Account Suspended!</strong> Your account has been suspended by an administrator.
                        You can browse but cannot place orders. Please contact support for assistance.
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// Helper function to check account status
const checkAccountStatus = () => {
    const status = localStorage.getItem('accountStatus');
    if (status === 'BANNED') {
        localStorage.clear();
        window.location.href = '/login?error=banned';
        return false;
    }
    return true;
};

export { AccountStatusBanner, checkAccountStatus };