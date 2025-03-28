import React, { useEffect, useState } from 'react';
import api from '../api';

const ProfilePage = () => {
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/profile');
                setForm(res.data);
            } catch (err) {
                console.error("Failed to fetch user info", err);
                setMessage("❌ An error occurred while loading data.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await api.put('/profile/update', form);
            setMessage("✅ Information updated successfully.");
        } catch (err) {
            setMessage("❌ Update failed.");
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
    }

    return (
        <div style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '30px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}>Profile Information</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Name" style={inputStyle} />
                <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone" style={inputStyle} />

                {(form.role !== 'courier') && (
                    <>
                        <input name="city" value={form.city || ''} onChange={handleChange} placeholder="City" style={inputStyle} />
                        <input name="district" value={form.district || ''} onChange={handleChange} placeholder="District" style={inputStyle} />
                        <input name="address" value={form.address || ''} onChange={handleChange} placeholder="Address" style={inputStyle} />
                    </>
                )}

                {form.role === 'restaurant_owner' && (
                    <>
                        <input name="businessHoursStart" value={form.businessHoursStart || ''} onChange={handleChange} placeholder="Opening Hour" style={inputStyle} />
                        <input name="businessHoursEnd" value={form.businessHoursEnd || ''} onChange={handleChange} placeholder="Closing Hour" style={inputStyle} />
                    </>
                )}
            </div>

            {message && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: message.includes("successfully") ? '#d4edda' : '#f8d7da',
                    color: message.includes("successfully") ? '#155724' : '#721c24',
                    fontSize: '14px',
                }}>
                    {message}
                </div>
            )}

            <button
                onClick={handleSave}
                style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Save
            </button>

            {/* Go Back to Dashboard Button */}
            <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    cursor: 'pointer'
                }}
            >
                Back to Dashboard
            </button>
        </div>
    );
};

const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '15px',
    width: '100%',
};

export default ProfilePage;
