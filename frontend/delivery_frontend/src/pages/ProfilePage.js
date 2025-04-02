import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';

const ProfilePage = () => {
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/profile');
                setForm(res.data);
            } catch (err) {
                console.error("Failed to fetch user info", err);
                setMessage("An error occurred while loading data.");
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
            setMessage("Information updated successfully.");
        } catch (err) {
            setMessage("Update failed.");
        }
    };

    // Render Customer Profile Form
    // Render Customer Profile Form (güncellenmiş versiyon)
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

            <div className="form-group mb-3">
                <label className="text-white">Phone</label>
                <input
                    name="phone"
                    value={form.phone || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                />
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Email</label>
                <input
                    name="email"
                    value={form.email || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                    disabled
                />

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
    // Render Restaurant Profile Form
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
                <input
                    name="phone"
                    value={form.phone || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                />
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Email</label>
                <input
                    name="email"
                    value={form.email || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                    disabled
                />

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
                        <label className="text-white">Average Preparation Time (minutes)</label>
                        <input
                            name="avgPrepTime"
                            value={form.avgPrepTime || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                            type="number"
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">Opening Time</label>
                        <input
                            name="businessHoursStart"
                            value={form.businessHoursStart || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                            placeholder="e.g. 08:00 AM"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="text-white">Closing Time</label>
                        <input
                            name="businessHoursEnd"
                            value={form.businessHoursEnd || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-white"
                            placeholder="e.g. 10:00 PM"
                        />
                    </div>
                </div>
            </div>
            <div className="form-group mb-3">
                <label className="text-white">Restaurant Description</label>
                <textarea
                    name="description"
                    value={form.description || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-white"
                    rows="3"
                    placeholder="Tell customers about your restaurant..."
                ></textarea>
            </div>
        </>
    );

    // Render Courier Profile Form
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
                <input
                    name="phone"
                    value={form.phone || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-light"
                />
            </div>

            <div className="form-group mb-3">
                <label className="text-white">Email</label>
                <input
                    name="email"
                    value={form.email || ''}
                    onChange={handleChange}
                    className="form-control bg-dark text-light"
                    disabled
                />
                <small className="text-muted">Email cannot be changed</small>
            </div>

            {/* <h5 className="mt-4 mb-3 border-bottom pb-2">Vehicle Details</h5>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label>Vehicle Type</label>
                        <select
                            name="vehicleType"
                            value={form.vehicleType || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-light"
                        >
                            <option value="">Select Vehicle Type</option>
                            <option value="bicycle">Bicycle</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="car">Car</option>
                            <option value="scooter">Scooter</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label>License Plate (if applicable)</label>
                        <input
                            name="licensePlate"
                            value={form.licensePlate || ''}
                            onChange={handleChange}
                            className="form-control bg-dark text-light"
                        />
                    </div>
                </div>
            </div>
            <div className="form-group mb-3">
                <label>Delivery Areas</label>
                <select
                    name="deliveryAreas"
                    value={form.deliveryAreas || []}
                    onChange={(e) => {
                        const options = e.target.options;
                        const selectedAreas = [];
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].selected) {
                                selectedAreas.push(options[i].value);
                            }
                        }
                        setForm({ ...form, deliveryAreas: selectedAreas });
                    }}
                    className="form-control bg-dark text-light"
                    multiple
                >
                    <option value="north">North District</option>
                    <option value="south">South District</option>
                    <option value="east">East District</option>
                    <option value="west">West District</option>
                    <option value="central">Central District</option>
                </select>
                <small className="text-muted">Hold Ctrl/Cmd to select multiple areas</small>
            </div> */}
        </>
    );

    return (
        <div className="text-light">
            {/* Header component */}
            <div className="container-fluid dashboard-header bg-black">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10">
                            <h2 className="text-warning text-center mb-3">Profile Settings</h2>
                            <p className="text-light text-center">Update your personal information</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content section */}
            <div className="container-fluid py-4 personel-info" style={{ minHeight: "70vh" }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10 col-sm-12">
                            {loading ? (
                                <div className="bg-dark p-5 rounded shadow text-center border border-secondary">
                                    <div className="spinner-border text-warning" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    <p className="mt-3 text-light">Loading your profile information...</p>
                                </div>
                            ) : (
                                <div className="bg-dark p-4 p-md-5 rounded shadow border border-secondary">
                                    <h4 className="mb-4 border-bottom border-secondary pb-3 text-warning">
                                        {role === 'restaurant' ? 'Restaurant Profile' :
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
                                                    role === 'restaurant' ? '/restaurant-dashboard' :
                                                        role === 'courier' ? '/courier-dashboard' : '/';
                                                window.location.href = homeLink;
                                            }}
                                            className="btn btn-outline-secondary text-light"
                                        >
                                            Back to Dashboard
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="btn btn-warning"
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
        </div >
    );
};

export default ProfilePage;