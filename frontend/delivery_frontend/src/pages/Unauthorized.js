// src/pages/Unauthorized.js
import React from 'react';

const Unauthorized = () => {
    return (
        <div style={{
            maxWidth: '600px',
            margin: '80px auto',
            padding: '30px',
            backgroundColor: '#fff3f3',
            border: '1px solid #f5c6cb',
            borderRadius: '10px',
            textAlign: 'center'
        }}>
            <h2 style={{ color: '#dc3545' }}>Access Denied</h2>
            <p>You do not have permission to access this page.</p>
        </div>
    );
};

export default Unauthorized;
