import React, { useState } from 'react';
import api from '../api';

const AddUserModal = ({ show, onClose, onUserAdded }) => {
    const [addUserForm, setAddUserForm] = useState({
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
        cuisineType: '',
        deliveryType: 'DELIVERY',
    });
    const [addUserError, setAddUserError] = useState('');

    const handleAddUserChange = (e) => {
        setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    };

    const submitAddUser = async (e) => {
        e.preventDefault();
        try {
            const endpoint = addUserForm.role === 'admin' ? '/admin/add-admin' : '/register';
            await api.post(endpoint, addUserForm);
            alert('User created successfully.');
            resetForm();
            if (onUserAdded) onUserAdded();
            onClose();
        } catch (err) {
            setAddUserError('Failed to create user.');
            console.error(err);
        }
    };

    const resetForm = () => {
        setAddUserForm({
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
            cuisineType: '',
            deliveryType: 'DELIVERY',
        });
        setAddUserError('');
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add New User</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={submitAddUser}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                name="name"
                                value={addUserForm.name}
                                onChange={handleAddUserChange}
                                placeholder="Name"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                value={addUserForm.email}
                                onChange={handleAddUserChange}
                                placeholder="Email"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                name="password"
                                type="password"
                                value={addUserForm.password}
                                onChange={handleAddUserChange}
                                placeholder="Password"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                name="phone"
                                value={addUserForm.phone}
                                onChange={handleAddUserChange}
                                placeholder="Phone"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select
                                name="role"
                                value={addUserForm.role}
                                onChange={handleAddUserChange}
                                className="form-control"
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="customer">Customer</option>
                                <option value="courier">Courier</option>
                                <option value="restaurant_owner">Restaurant Owner</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {(addUserForm.role === 'customer' || addUserForm.role === 'restaurant_owner') && (
                            <>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>City</label>
                                        <input
                                            name="city"
                                            value={addUserForm.city}
                                            onChange={handleAddUserChange}
                                            placeholder="City"
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>District</label>
                                        <input
                                            name="district"
                                            value={addUserForm.district}
                                            onChange={handleAddUserChange}
                                            placeholder="District"
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={addUserForm.address}
                                        onChange={handleAddUserChange}
                                        placeholder="Address"
                                        className="form-control textarea"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {addUserForm.role === 'restaurant_owner' && (
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Opening Hour</label>
                                    <input
                                        name="businessHoursStart"
                                        value={addUserForm.businessHoursStart}
                                        onChange={handleAddUserChange}
                                        placeholder="Opening Hour (e.g. 09:00)"
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="form-group half">
                                    <label>Closing Hour</label>
                                    <input
                                        name="businessHoursEnd"
                                        value={addUserForm.businessHoursEnd}
                                        onChange={handleAddUserChange}
                                        placeholder="Closing Hour (e.g. 22:00)"
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cuisine Type</label>
                                    <input
                                        name="cuisineType"
                                        value={addUserForm.cuisineType}
                                        onChange={handleAddUserChange}
                                        placeholder="e.g. Turkish, Italian"
                                        className="form-control"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Delivery Type</label>
                                    <select
                                        name="deliveryType"
                                        value={addUserForm.deliveryType}
                                        onChange={handleAddUserChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="DELIVERY">Delivery</option>
                                        <option value="PICKUP">Pickup</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {addUserError && <p className="error-message">{addUserError}</p>}

                        <div className="modal-footer">
                            <button type="submit" className="btn-save">Save User</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;