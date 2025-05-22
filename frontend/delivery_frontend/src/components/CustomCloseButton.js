import React from 'react';

const CustomCloseButton = ({ closeToast }) => (
    <button
        onClick={closeToast}
        style={{
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            margin: '0',
            width: '35px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        ×
    </button>

);

export default CustomCloseButton; 