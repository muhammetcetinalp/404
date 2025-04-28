import React, { useState } from 'react';
import api from '../api';
import '../styles/admin.css';

const AddUserModal = ({ show, onClose, onUserAdded }) => {
    const initialFormState = {
        name: '',
        email: '',
        password: '',
        role: 'customer',
        phone: '',
        address: '',
        city: '',
        district: '',
        businessHoursStart: '',
        businessHoursEnd: '',
    };

    const [form, setForm] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim() || !emailRegex.test(form.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation - at least 6 characters
        if (!form.password || form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Phone validation for Turkish numbers
        if (form.phone) {
            // Turkish mobile numbers should start with 5 and have exactly 10 digits
            if (!form.phone.length !== 10) {
                newErrors.phone = 'Turkish mobile numbers must start with 5 and have 10 digits (5XXXXXXXXX)';
            } else if (!/^\d+$/.test(form.phone)) {
                newErrors.phone = 'Phone number should contain only digits';
            }
        }

        // Restaurant owner specific validations
        if (form.role === 'restaurant_owner') {
            // Business hours validation (24-hour format: 0000-2359)
            const timeRegex = /^([01]\d|2[0-3])([0-5]\d)$/;

            if (!form.businessHoursStart) {
                newErrors.businessHoursStart = 'Opening hours are required';
            } else if (!timeRegex.test(form.businessHoursStart)) {
                newErrors.businessHoursStart = 'Enter valid opening hours in 24-hour format (e.g., 0900)';
            }

            if (!form.businessHoursEnd) {
                newErrors.businessHoursEnd = 'Closing hours are required';
            } else if (!timeRegex.test(form.businessHoursEnd)) {
                newErrors.businessHoursEnd = 'Enter valid closing hours in 24-hour format (e.g., 2200)';
            }

            // Check if end time is after start time
            if (form.businessHoursStart && form.businessHoursEnd &&
                parseInt(form.businessHoursStart) >= parseInt(form.businessHoursEnd)) {
                newErrors.businessHoursEnd = 'Closing time must be after opening time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for phone field
        if (name === 'phone') {
            // Only allow digits
            const phoneValue = value.replace(/\D/g, '');

            // Enforce first digit as 5 if any digits are entered
            let formattedPhone = phoneValue;
            if (phoneValue.length > 0 && phoneValue[0] !== '5') {
                formattedPhone = '5' + phoneValue.substring(1);
            }

            // Limit to 10 digits (Turkish mobile format)
            formattedPhone = formattedPhone.substring(0, 10);

            setForm({ ...form, [name]: formattedPhone });

            // Clear error if it was previously shown and input is now valid
            if (errors.phone && formattedPhone.startsWith('5') && formattedPhone.length === 10) {
                setErrors({ ...errors, phone: null });
            }

            return;
        }

        // Special handling for business hours - enforce numeric input
        if (name === 'businessHoursStart' || name === 'businessHoursEnd') {
            // Only allow digits and limit to 4 characters
            const timeValue = value.replace(/\D/g, '').substring(0, 4);
            setForm({ ...form, [name]: timeValue });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    // Real-time phone validation for better UX
    const validatePhoneOnBlur = () => {
        if (form.phone && (form.phone.length < 10 || !form.phone.startsWith('5'))) {
            setErrors({
                ...errors,
                phone: 'Turkish mobile numbers must start with 5 and have 10 digits (5XXXXXXXXX)'
            });
        } else if (form.phone) {
            setErrors({ ...errors, phone: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Format phone number to include +90 prefix
            const formattedData = {
                ...form,
                phone: form.phone ? `+90${form.phone}` : '',
            };

            await api.post('/admin/add-user', formattedData);
            setIsLoading(false);
            onUserAdded();
            onClose();

            // Reset form
            setForm(initialFormState);
            setErrors({});
        } catch (err) {
            setIsLoading(false);
            console.error("Failed to add user", err);

            // Handle API errors
            if (err.response && err.response.data && err.response.data.message) {
                alert(`Error: ${err.response.data.message}`);
            } else {
                alert('An error occurred while adding the user. Please try again.');
            }
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add New User</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Role <span className="required">*</span></label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="customer">Customer</option>
                                <option value="courier">Courier</option>
                                <option value="restaurant_owner">Restaurant Owner</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className={`form-control ${errors.name ? 'error' : ''}`}
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label>Email <span className="required">*</span></label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className={`form-control ${errors.email ? 'error' : ''}`}
                            />
                            {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label>Password <span className="required">*</span></label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Password (min 6 characters)"
                                className={`form-control ${errors.password ? 'error' : ''}`}
                            />
                            {errors.password && <div className="error-message">{errors.password}</div>}
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <div className="phone-input-container">
                                <div className="phone-prefix">+90</div>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    onBlur={validatePhoneOnBlur}
                                    placeholder="5XXXXXXXXX"
                                    className={`form-control phone-input ${errors.phone ? 'error' : ''}`}
                                />
                            </div>
                            <div className="phone-hint">Must start with 5 and be exactly 10 digits</div>
                            {errors.phone && <div className="error-message">{errors.phone}</div>}
                        </div>

                        {form.role !== 'courier' && (
                            <>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>City</label>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>District</label>
                                        <input
                                            name="district"
                                            value={form.district}
                                            onChange={handleChange}
                                            placeholder="District"
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Full Address"
                                        className="form-control textarea"
                                    />
                                </div>
                            </>
                        )}

                        {form.role === 'restaurant_owner' && (
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Opening Hour <span className="required">*</span></label>
                                    <input
                                        name="businessHoursStart"
                                        value={form.businessHoursStart}
                                        onChange={handleChange}
                                        placeholder="e.g. 0900"
                                        className={`form-control ${errors.businessHoursStart ? 'error' : ''}`}
                                    />
                                    {errors.businessHoursStart && <div className="error-message">{errors.businessHoursStart}</div>}
                                    <div className="time-hint">24-hour format (0000-2359)</div>
                                </div>
                                <div className="form-group half">
                                    <label>Closing Hour <span className="required">*</span></label>
                                    <input
                                        name="businessHoursEnd"
                                        value={form.businessHoursEnd}
                                        onChange={handleChange}
                                        placeholder="e.g. 2200"
                                        className={`form-control ${errors.businessHoursEnd ? 'error' : ''}`}
                                    />
                                    {errors.businessHoursEnd && <div className="error-message">{errors.businessHoursEnd}</div>}
                                    <div className="time-hint">24-hour format (0000-2359)</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;