import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const ProfilePage = () => {
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

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
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/profile');
                setForm(res.data.profile || res.data);
            } catch (err) {
                console.error("Failed to fetch user info", err);
                toast.error("An error occurred while loading data.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (form.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Phone validation for Turkish format
        if (form.phone) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(form.phone)) {
                newErrors.phone = "Phone number must be 10 digits (5XXXXXXXXX)";
            }
        }

        // Business hours validation for restaurant owners
        if (role === 'restaurant_owner') {
            if (form.businessHoursStart) {
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(form.businessHoursStart)) {
                    newErrors.businessHoursStart = "Please enter time in format HH:MM (e.g., 08:00)";
                }
            }

            if (form.businessHoursEnd) {
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(form.businessHoursEnd)) {
                    newErrors.businessHoursEnd = "Please enter time in format HH:MM (e.g., 22:00)";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // For phone field, handle the formatting
        if (name === 'phone') {
            // Remove any non-numeric characters
            const numericValue = value.replace(/\D/g, '');
            // Limit to 10 digits
            const formattedValue = numericValue.slice(0, 10);
            setForm({ ...form, [name]: formattedValue });

            // Clear error when user types
            if (errors.phone) {
                setErrors({ ...errors, phone: null });
            }
        } else {
            setForm({ ...form, [name]: value });

            // Clear the specific error when user makes changes
            if (errors[name]) {
                setErrors({ ...errors, [name]: null });
            }
        }
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                await api.put('/profile/update', form);
                toast.success("Information updated successfully.");

                setTimeout(() => {
                    if (role === 'customer') {
                        navigate('/customer-dashboard');
                    } else if (role === 'restaurant_owner') {
                        navigate('/restaurant-dashboard');
                    } else if (role === 'courier') {
                        navigate('/courier-dashboard');
                    }
                }, 2000);

            } catch (err) {
                toast.error("Update failed.");
            }
        } else {
            toast.error("Please correct the errors before saving.");
        }
    };

    const renderCustomerForm = () => (
        <>
            <div className="form-group mb-3">
                <label className="text-white">Name</label>
                <input
                    name="name"
                    value={form.name || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                />
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                closeButton={<CustomCloseButton />}
                toastClassName="custom-toast"
                bodyClassName="custom-toast-body"
                icon={true}
            />

            <div className="form-group mb-3">
                <label className="text-white">Phone</label>
                <div className="input-group">
                    <span className="input-group-text bg-dark text-white">+90</span>
                    <input
                        name="phone"
                        value={form.phone || ''}
                        onChange={handleChange}
                        className={`form-control bg-dark text-white ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="5XXXXXXXXX"
                    />
                </div>
                {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Email</label>
                <input
                    name="email"
                    value={form.email || ''}
                    onChange={handleChange}
                    className={`form-control bg-dark text-white ${errors.email ? 'is-invalid' : ''}`}
                    disabled
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>

            <h5 className="mt-4 mb-3 border-bottom pb-2 text-white">Delivery Address</h5>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">City</label>
                        <input
                            name="city"
                            value={form.city || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">District</label>
                        <input
                            name="district"
                            value={form.district || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                        />
                    </div>
                </div>
            </div>
            <div className="form-group mb-3">
                <label className="text-white">Full Address</label>
                <textarea
                    name="address"
                    value={form.address || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                    rows="3"
                ></textarea>
            </div>
        </>
    );

    const renderCourierForm = () => (
        <>
            <div className="form-group mb-3">
                <label className="text-white">Name</label>
                <input
                    name="name"
                    value={form.name || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-light"
                />
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Phone</label>
                <div className="input-group">
                    <span className="input-group-text bg-dark text-white">+90</span>
                    <input
                        name="phone"
                        value={form.phone || ''}
                        onChange={handleChange}
                        className={`form-control bg-dark text-light ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="5XXXXXXXXX"
                    />
                </div>
                {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Email</label>
                <input
                    name="email"
                    value={form.email || ''}
                    className={`form-control bg-dark text-light ${errors.email ? 'is-invalid' : ''}`}
                    disabled
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>
        </>
    );

    const renderRestaurantForm = () => (
        <>
            <div className="form-group mb-3">
                <label className="text-white">Restaurant Name</label>
                <input
                    name="name"
                    value={form.name || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                />
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Phone</label>
                <div className="input-group">
                    <span className="input-group-text bg-dark text-white">+90</span>
                    <input
                        name="phone"
                        value={form.phone || ''}
                        onChange={handleChange}
                        className={`form-control bg-dark text-white ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="5XXXXXXXXX"
                    />
                </div>
                {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Email</label>
                <input
                    name="email"
                    value={form.email || ''}
                    className={`form-control bg-dark text-white ${errors.email ? 'is-invalid' : ''}`}
                    disabled
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>

            <h5 className="mt-4 mb-3 border-bottom pb-2 text-white">Restaurant Address</h5>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">City</label>
                        <input
                            name="city"
                            value={form.city || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">District</label>
                        <input
                            name="district"
                            value={form.district || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                        />
                    </div>
                </div>
            </div>
            <div className="form-group mb-3">
                <label className="text-white">Full Address</label>
                <textarea
                    name="address"
                    value={form.address || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                    rows="3"
                ></textarea>
            </div>

            <h5 className="mt-4 mb-3 border-bottom pb-2 text-white">Business Details</h5>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">Cuisine Type</label>
                        <select
                            name="cuisineType"
                            value={form.cuisineType || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                        >
                            <option value="">Select Cuisine Type</option>
                            <option value="turkish">Turkish</option>
                            <option value="italian">Italian</option>
                            <option value="mexican">Mexican</option>
                            <option value="american">American</option>
                            <option value="asian">Asian</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">Opening Time</label>
                        <input
                            name="businessHoursStart"
                            value={form.businessHoursStart || ''}
                            onChange={handleChange}
                            className={`form-control bg-dark text-white ${errors.businessHoursStart ? 'is-invalid' : ''}`}
                            placeholder="08:00"
                        />
                        {errors.businessHoursStart && <div className="invalid-feedback d-block">{errors.businessHoursStart}</div>}
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">Closing Time</label>
                        <input
                            name="businessHoursEnd"
                            value={form.businessHoursEnd || ''}
                            onChange={handleChange}
                            className={`form-control bg-dark text-white ${errors.businessHoursEnd ? 'is-invalid' : ''}`}
                            placeholder="22:00"
                        />
                        {errors.businessHoursEnd && <div className="invalid-feedback d-block">{errors.businessHoursEnd}</div>}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="text-light">
            <div className="container-fluid dashboard-header bg-black">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10">
                            <h2 className="text-orange text-warning text-center mb-3">Profile Settings</h2>
                            <p className="text-light text-center">Update your personal information</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-4 personel-info" style={{ minHeight: "70vh" }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10 col-sm-12">
                            {loading ? (
                                <div className="bg-dark p-5 rounded shadow text-center border border-secondary">
                                    <div className="spinner-border text-warning" role="status" />
                                    <p className="mt-3 text-light">Loading your profile information...</p>
                                </div>
                            ) : (
                                <div className="bg-dark p-4 p-md-5 rounded shadow border border-secondary">
                                    <h4 className="text-white mb-4 border-bottom border-secondary pb-3 text-warning">
                                        {role === 'restaurant_owner' ? 'Restaurant Profile' :
                                            role === 'courier' ? 'Courier Profile' : 'Customer Profile'}
                                    </h4>

                                    {role === 'customer' && renderCustomerForm()}
                                    {role === 'restaurant_owner' && renderRestaurantForm()}
                                    {role === 'courier' && renderCourierForm()}

                                    {message && (
                                        <div
                                            className={`alert ${message.includes("successfully") ? 'alert-success' : 'alert-danger'} mt-3`}
                                            role="alert"
                                        >
                                            {message}
                                        </div>
                                    )}

                                    <div className="mt-4 d-flex justify-content-between">
                                        <button
                                            onClick={() => {
                                                const homeLink = role === 'customer' ? '/customer-dashboard' :
                                                    role === 'restaurant_owner' ? '/restaurant-dashboard' :
                                                        role === 'courier' ? '/courier-dashboard' : '/';
                                                window.location.href = homeLink;
                                            }}
                                            className="btn btn-outline-secondary text-light"
                                        >
                                            Back to Dashboard
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="btn-orange btn btn-warning"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProfilePage;