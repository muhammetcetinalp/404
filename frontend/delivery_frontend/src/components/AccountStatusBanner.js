import React from 'react';

// Account Status Banner Component
const AccountStatusBanner = () => {
    const accountStatus = localStorage.getItem('accountStatus');

    if (accountStatus === 'SUSPENDED') {
        return (
            <div className="account-status-banner suspended">
                <div className="container">
                    <div className="alert alert-warning">
                        <strong>Account Suspended!</strong> Your account has been suspended by an administrator.
                        Some features may be limited. Please contact support for assistance.
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