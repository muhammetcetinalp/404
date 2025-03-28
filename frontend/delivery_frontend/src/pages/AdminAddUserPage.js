import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AdminAddUserPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: '',
        address: '',
        city: '',
        district: '',
        businessHoursStart: '',
        businessHoursEnd: '',
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = form.role === 'admin' ? '/admin/add-admin' : '/register';
            await api.post(endpoint, form);
            alert('User created successfully.');
            navigate('/admin/users');
        } catch (err) {
            setError('Failed to create user.');
            console.error(err);
        }
    };


    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center' }}>Add New User</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input name="name" placeholder="Name" required onChange={handleChange} />
                <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
                <input name="phone" placeholder="Phone" required onChange={handleChange} />

                <select name="role" value={form.role} onChange={handleChange} required>
                    <option value="">Select Role</option>
                    <option value="customer">Customer</option>
                    <option value="courier">Courier</option>
                    <option value="restaurant_owner">Restaurant Owner</option>
                    <option value="admin">Admin</option>

                </select>

                {(form.role === 'customer' || form.role === 'restaurant_owner') && (
                    <>
                        <input name="city" placeholder="City" required onChange={handleChange} />
                        <input name="district" placeholder="District" required onChange={handleChange} />
                        <input name="address" placeholder="Address" required onChange={handleChange} />
                    </>
                )}

                {form.role === 'restaurant_owner' && (
                    <>
                        <input name="businessHoursStart" placeholder="Opening Hour (e.g. 09:00)" required onChange={handleChange} />
                        <input name="businessHoursEnd" placeholder="Closing Hour (e.g. 22:00)" required onChange={handleChange} />
                    </>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Save
                </button>

                <button type="button" onClick={() => navigate('/admin/users')} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Back
                </button>
            </form>
        </div>
    );
};

export default AdminAddUserPage;
