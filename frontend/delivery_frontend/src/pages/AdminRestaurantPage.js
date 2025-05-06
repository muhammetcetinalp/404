import React, { useEffect, useState } from 'react';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/admin.css';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const AdminRestaurantPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addUserForm, setAddUserForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'restaurant_owner',
        address: '',
        city: '',
        district: '',
        businessHoursStart: '',
        businessHoursEnd: '',
        cuisineType: '',
        deliveryType: 'DELIVERY',
    });
    const [addUserError, setAddUserError] = useState('');

    // Validation errors state
    const [formErrors, setFormErrors] = useState({});
    const [editFormErrors, setEditFormErrors] = useState({});

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        // Turkish phone number format validation (10 digits after the +90)
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const validateTimeFormat = (time) => {
        // Time format validation (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    // Function to format time input with automatic colon
    const formatTimeInput = (value) => {
        // Remove any non-digit characters
        const digits = value.replace(/\D/g, '');

        // Limit to 4 digits
        const limitedDigits = digits.substring(0, 4);

        // Format with colon
        if (limitedDigits.length > 2) {
            const hours = limitedDigits.substring(0, 2);
            const minutes = limitedDigits.substring(2);

            // Validate hours (00-23)
            const hoursNum = parseInt(hours, 10);
            const validHours = hoursNum >= 0 && hoursNum <= 23 ? hours : '00';

            // Validate minutes (00-59)
            const minutesNum = parseInt(minutes, 10);
            const validMinutes = minutesNum >= 0 && minutesNum <= 59 ? minutes : '00';

            return `${validHours}:${validMinutes}`;
        } else if (limitedDigits.length > 0) {
            return limitedDigits;
        }

        return '';
    };

    const validateForm = (form, isEdit = false) => {
        const errors = {};

        if (!isEdit && !validateEmail(form.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!validatePhone(form.phone)) {
            errors.phone = 'Please enter a valid Turkish phone number (10 digits without +90)';
        }

        if (!form.name || form.name.trim() === '') {
            errors.name = 'Name is required';
        }

        if (!isEdit && !form.password) {
            errors.password = 'Password must be filled';
        }

        if (!form.city || form.city.trim() === '') {
            errors.city = 'City is required';
        }

        if (!form.district || form.district.trim() === '') {
            errors.district = 'District is required';
        }

        if (!form.address || form.address.trim() === '') {
            errors.address = 'Address is required';
        }

        if (!validateTimeFormat(form.businessHoursStart)) {
            errors.businessHoursStart = 'Please enter a valid time format (HH:MM)';
        }

        if (!validateTimeFormat(form.businessHoursEnd)) {
            errors.businessHoursEnd = 'Please enter a valid time format (HH:MM)';
        }

        if (!form.cuisineType || form.cuisineType.trim() === '') {
            errors.cuisineType = 'Cuisine type is required';
        }

        return errors;
    };

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/admin/all-users');
            setRestaurants(res.data.restaurantOwners || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch restaurants", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleDelete = async (email) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="custom-ui">
                        <div className="custom-ui-icon">
                            <FontAwesomeIcon icon={faTrash} />
                        </div>
                        <h1>Delete Restaurant</h1>
                        <p>Are you sure you want to delete this restaurant?</p>
                        <div className="custom-ui-buttons">
                            <button
                                className="btn-cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-delete"
                                onClick={async () => {
                                    try {
                                        await api.delete(`/admin/delete-user/${email}`);
                                        toast.success('Restaurant owner deleted successfully!');
                                        fetchRestaurants();
                                        onClose();
                                    } catch (err) {
                                        const errorMessage = err.response?.data || "Failed to delete restaurant owner. Please try again.";
                                        toast.error(errorMessage);
                                        console.error("Failed to delete restaurant owner", err.response || err);
                                        onClose();
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            }
        });
    };
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
    const handleStatusChange = async (email, newStatus) => {
        try {
            await api.put(`/admin/update-user/${email}`, { status: newStatus });

            fetchRestaurants(); // Refresh the list after status change
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleApproveRestaurant = async (restaurantId) => {
        try {
            await api.post(`/admin/approve-restaurant/${restaurantId}`);

            toast.success('Restaurant approved successfully', {
                style: {
                    backgroundColor: '#eb6825',
                    color: 'white',
                    fontWeight: 'bold',
                },
            });
            fetchRestaurants(); // Refresh the list after approval
        } catch (err) {
            console.error("Failed to approve restaurant", err);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditForm({ ...user });
        setEditFormErrors({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        // Apply time formatting for business hours fields
        if (name === 'businessHoursStart' || name === 'businessHoursEnd') {
            setEditForm({ ...editForm, [name]: formatTimeInput(value) });
        } else {
            setEditForm({ ...editForm, [name]: value });
        }

        // Clear error for this field when user starts typing
        if (editFormErrors[name]) {
            setEditFormErrors({
                ...editFormErrors,
                [name]: ''
            });
        }
    };

    const saveEdit = async () => {
        const errors = validateForm(editForm, true);

        if (Object.keys(errors).length > 0) {
            setEditFormErrors(errors);
            return;
        }

        try {
            // Format phone number with +90 prefix if it doesn't have it
            const formattedData = {
                ...editForm,
                phone: editForm.phone
            };

            await api.put(`/admin/update-user/${selectedUser.email}`, formattedData);
            toast.success('Changes saved successfully!', {
                style: {
                    backgroundColor: '#eb6825',
                    color: 'white',
                    fontWeight: 'bold',
                },
            });
            setSelectedUser(null);
            fetchRestaurants(); // Refresh the list after edit
        } catch (err) {
            console.error("Failed to update restaurant", err);
            toast.error('Failed to update restaurant', {
                style: {
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    fontWeight: 'bold',
                },
            });
        }
    };

    const handleAddUserChange = (e) => {
        const { name, value } = e.target;

        // Apply time formatting for business hours fields
        if (name === 'businessHoursStart' || name === 'businessHoursEnd') {
            setAddUserForm({ ...addUserForm, [name]: formatTimeInput(value) });
        } else {
            setAddUserForm({ ...addUserForm, [name]: value });
        }

        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const submitAddUser = async (e) => {
        e.preventDefault();

        const errors = validateForm(addUserForm);

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            // Format phone number with +90 prefix
            const formattedData = {
                ...addUserForm,
                phone: addUserForm.phone
            };

            await api.post('/register', formattedData);
            toast.success('Restaurant created successfully!', {
                style: {
                    backgroundColor: '#eb6825',
                    color: 'white',
                    fontWeight: 'bold',
                },
            });
            setShowAddModal(false);
            setAddUserForm({
                name: '',
                email: '',
                password: '',
                phone: '',
                role: 'restaurant_owner',
                address: '',
                city: '',
                district: '',
                businessHoursStart: '',
                businessHoursEnd: '',
                cuisineType: '',
                deliveryType: 'DELIVERY',
            });
            setFormErrors({});
            fetchRestaurants(); // Refresh the list after adding
        } catch (err) {
            setAddUserError('Failed to create restaurant.');
            console.error(err);
        }
    };

    const filteredRestaurants = restaurants.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.cuisineType?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusClass = (status) => {
        if (!status) return '';
        switch (status.toLowerCase()) {
            case 'active': return 'status-active';
            case 'suspended': return 'status-suspended';
            case 'banned': return 'status-banned';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="admin-app-container">
                <Header />
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Loading restaurant data...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="admin-app-container">
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
            <Header />
            <div className="admin-dashboard">
                <AdminLayout active="restaurants"></AdminLayout>

                <div className="admin-content">
                    <div className="page-header">

                        <div className="header-actions">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-orange btn-add-user"
                            >
                                <i className="add-icon"></i>
                                Add New Restaurant
                            </button>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="card-header">
                            <div className="search-container">
                                <i className="search-icon"></i>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, email or cuisine type..."
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="user-content">
                            <div className="user-table-container">
                                {filteredRestaurants.length > 0 ? (
                                    <table className="user-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Cuisine</th>
                                                <th>Status</th>
                                                <th>Approved</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRestaurants.map(user => (
                                                <tr key={user.email} className="user-row">
                                                    <td className="user-name">{user.name}</td>
                                                    <td className="user-email">{user.email}</td>
                                                    <td>{user.cuisineType || 'Not specified'}</td>
                                                    <td>
                                                        <span className={`status-badge ${getStatusClass(user.accountStatus)}`}>
                                                            {user.accountStatus || 'ACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {user.approved ? (
                                                            <span className="status-badge status-active">Approved</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleApproveRestaurant(user.restaurantId)}
                                                                className="btn-approve2"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="user-actions">
                                                        <button onClick={() => openEditModal(user)} className="btn-edit">
                                                            <i className="edit-icon"></i>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(user.email)} className="btn-delete">
                                                            <i className="delete-icon"></i>
                                                            Delete
                                                        </button>
                                                        <div className="status-dropdown">
                                                            <button className="btn-status btn-adminstatus">Status ▼</button>

                                                            <div className="status-dropdown-content">
                                                                <button onClick={() => handleStatusChange(user.email, 'ACTIVE')} className="status-option status-active">
                                                                    Activate
                                                                </button>
                                                                <button onClick={() => handleStatusChange(user.email, 'SUSPENDED')} className="status-option status-suspended" style={{ color: 'orange' }}>
                                                                    Suspend
                                                                </button>
                                                                <button onClick={() => handleStatusChange(user.email, 'BANNED')} className="status-option status-banned">
                                                                    Ban
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="no-data-container">
                                        <p className="no-data">No restaurants found matching your search criteria</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Restaurant: {editForm.name}</h3>
                            <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    name="name"
                                    value={editForm.name || ''}
                                    onChange={handleEditChange}
                                    placeholder="Name"
                                    className={`form-control ${editFormErrors.name ? 'error-input' : ''}`}
                                />
                                {editFormErrors.name && <div className="error-message">{editFormErrors.name}</div>}
                            </div>
                            <div className="form-group">
                                <label>Account Status</label>
                                <select
                                    name="accountStatus"
                                    value={editForm.accountStatus || 'ACTIVE'}
                                    onChange={handleEditChange}
                                    className="form-control"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="BANNED">Banned</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phone (10 digits without +90)</label>
                                <input
                                    name="phone"
                                    value={editForm.phone || ''}
                                    onChange={handleEditChange}
                                    placeholder="5XX XXX XXXX"
                                    className={`form-control ${editFormErrors.phone ? 'error-input' : ''}`}
                                />
                                {editFormErrors.phone && <div className="error-message">{editFormErrors.phone}</div>}
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>City</label>
                                    <input
                                        name="city"
                                        value={editForm.city || ''}
                                        onChange={handleEditChange}
                                        placeholder="City"
                                        className={`form-control ${editFormErrors.city ? 'error-input' : ''}`}
                                    />
                                    {editFormErrors.city && <div className="error-message">{editFormErrors.city}</div>}
                                </div>
                                <div className="form-group half">
                                    <label>District</label>
                                    <input
                                        name="district"
                                        value={editForm.district || ''}
                                        onChange={handleEditChange}
                                        placeholder="District"
                                        className={`form-control ${editFormErrors.district ? 'error-input' : ''}`}
                                    />
                                    {editFormErrors.district && <div className="error-message">{editFormErrors.district}</div>}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={editForm.address || ''}
                                    onChange={handleEditChange}
                                    placeholder="Address"
                                    className={`form-control textarea ${editFormErrors.address ? 'error-input' : ''}`}
                                />
                                {editFormErrors.address && <div className="error-message">{editFormErrors.address}</div>}
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Opening Hour</label>
                                    <input
                                        name="businessHoursStart"
                                        value={editForm.businessHoursStart || ''}
                                        onChange={handleEditChange}
                                        placeholder="HH:MM"
                                        className={`form-control ${editFormErrors.businessHoursStart ? 'error-input' : ''}`}
                                        maxLength={5}
                                    />
                                    {editFormErrors.businessHoursStart && <div className="error-message">{editFormErrors.businessHoursStart}</div>}
                                </div>
                                <div className="form-group half">
                                    <label>Closing Hour</label>
                                    <input
                                        name="businessHoursEnd"
                                        value={editForm.businessHoursEnd || ''}
                                        onChange={handleEditChange}
                                        placeholder="HH:MM"
                                        className={`form-control ${editFormErrors.businessHoursEnd ? 'error-input' : ''}`}
                                        maxLength={5}
                                    />
                                    {editFormErrors.businessHoursEnd && <div className="error-message">{editFormErrors.businessHoursEnd}</div>}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cuisine Type</label>
                                <input
                                    name="cuisineType"
                                    value={editForm.cuisineType || ''}
                                    onChange={handleEditChange}
                                    placeholder="e.g. Italian, Turkish"
                                    className={`form-control ${editFormErrors.cuisineType ? 'error-input' : ''}`}
                                />
                                {editFormErrors.cuisineType && <div className="error-message">{editFormErrors.cuisineType}</div>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={saveEdit} className="btn-orange btn-save">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Restaurant</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowAddModal(false)}
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
                                        className={`form-control ${formErrors.name ? 'error-input' : ''}`}
                                    />
                                    {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={addUserForm.email}
                                        onChange={handleAddUserChange}
                                        placeholder="Email"
                                        className={`form-control ${formErrors.email ? 'error-input' : ''}`}
                                    />
                                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={addUserForm.password}
                                        onChange={handleAddUserChange}
                                        placeholder="Password"
                                        className={`form-control ${formErrors.password ? 'error-input' : ''}`}
                                    />
                                    {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Phone (10 digits without +90)</label>
                                    <input
                                        name="phone"
                                        value={addUserForm.phone}
                                        onChange={handleAddUserChange}
                                        placeholder="5XX XXX XXXX"
                                        className={`form-control ${formErrors.phone ? 'error-input' : ''}`}
                                    />
                                    {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>City</label>
                                        <input
                                            name="city"
                                            value={addUserForm.city}
                                            onChange={handleAddUserChange}
                                            placeholder="City"
                                            className={`form-control ${formErrors.city ? 'error-input' : ''}`}
                                        />
                                        {formErrors.city && <div className="error-message">{formErrors.city}</div>}
                                    </div>
                                    <div className="form-group half">
                                        <label>District</label>
                                        <input
                                            name="district"
                                            value={addUserForm.district}
                                            onChange={handleAddUserChange}
                                            placeholder="District"
                                            className={`form-control ${formErrors.district ? 'error-input' : ''}`}
                                        />
                                        {formErrors.district && <div className="error-message">{formErrors.district}</div>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={addUserForm.address}
                                        onChange={handleAddUserChange}
                                        placeholder="Address"
                                        className={`form-control textarea ${formErrors.address ? 'error-input' : ''}`}
                                    />
                                    {formErrors.address && <div className="error-message">{formErrors.address}</div>}
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Opening Hour (Enter 4 digits)</label>
                                        <input
                                            name="businessHoursStart"
                                            value={addUserForm.businessHoursStart}
                                            onChange={handleAddUserChange}
                                            placeholder="0900 for 09:00"
                                            className={`form-control ${formErrors.businessHoursStart ? 'error-input' : ''}`}
                                            maxLength={5}
                                        />
                                        {formErrors.businessHoursStart && <div className="error-message">{formErrors.businessHoursStart}</div>}
                                    </div>
                                    <div className="form-group half">
                                        <label>Closing Hour (Enter 4 digits)</label>
                                        <input
                                            name="businessHoursEnd"
                                            value={addUserForm.businessHoursEnd}
                                            onChange={handleAddUserChange}
                                            placeholder="2200 for 22:00"
                                            className={`form-control ${formErrors.businessHoursEnd ? 'error-input' : ''}`}
                                            maxLength={5}
                                        />
                                        {formErrors.businessHoursEnd && <div className="error-message">{formErrors.businessHoursEnd}</div>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Cuisine Type</label>
                                    <input
                                        name="cuisineType"
                                        value={addUserForm.cuisineType}
                                        onChange={handleAddUserChange}
                                        placeholder="e.g. Italian, Turkish"
                                        className={`form-control ${formErrors.cuisineType ? 'error-input' : ''}`}
                                    />
                                    {formErrors.cuisineType && <div className="error-message">{formErrors.cuisineType}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Delivery Type</label>
                                    <select
                                        name="deliveryType"
                                        value={addUserForm.deliveryType}
                                        onChange={handleAddUserChange}
                                        className="form-control"
                                    >
                                        <option value="DELIVERY">Delivery</option>
                                        <option value="PICKUP">Pickup</option>
                                        <option value="BOTH">Both</option>
                                    </select>
                                </div>

                                {addUserError && <p className="error-message">{addUserError}</p>}

                                <div className="modal-footer">
                                    <button type="submit" className="btn-orange btn-save">Save Restaurant</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default AdminRestaurantPage;