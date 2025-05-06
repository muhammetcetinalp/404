import React, { useEffect, useState } from 'react';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/admin.css';
import AdminLayout from './AdminLayout';
// Import confirmation dialog library
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
// Import FontAwesome if you need icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const AdminCustomerPage = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addUserError, setAddUserError] = useState('');
    const [addUserForm, setAddUserForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
        address: '',
        city: '',
        district: '',
    });

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

    const validateForm = (form, isEdit = false) => {
        const errors = {};

        if (!validateEmail(form.email) && !isEdit) {
            errors.email = 'Please enter a valid email address';
        }

        if (!validatePhone(form.phone)) {
            errors.phone = 'Please enter a valid Turkish phone number (10 digits without +90)';
        }

        if (!form.name || form.name.trim() === '') {
            errors.name = 'Name is required';
        }

        if (!isEdit && (!form.password)) {
            errors.password = 'Password must be fill';
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

        return errors;
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
    const fetchCustomers = async () => {
        try {
            const res = await api.get('/admin/all-users');
            setCustomers(res.data.customers || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch customers", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Modified delete handler to use confirmAlert
    // ... (other code in AdminCustomerPage.js) ...

    // Modified delete handler to use confirmAlert
    const handleDelete = async (email) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="custom-ui">
                        <div className="custom-ui-icon">
                            <FontAwesomeIcon icon={faTrash} />
                        </div>
                        <h1>Delete Customer</h1>
                        <p>Are you sure you want to delete this customer?</p>
                        <div className="custom-ui-buttons">
                            <button
                                className="btn-cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            {/* THIS IS THE BUTTON YOU NEED TO MODIFY */}
                            <button
                                className="btn-delete"
                                onClick={async () => { // <<< START OF MODIFICATION
                                    try {
                                        await api.delete(`/admin/delete-user/${email}`);
                                        // Use toast for success message
                                        toast.success('Customer deleted successfully!');
                                        fetchCustomers(); // Refresh the list after deletion
                                        onClose();
                                    } catch (err) {
                                        // Display the error message from the backend using toast
                                        const errorMessage = err.response?.data || "Failed to delete customer. Please try again.";
                                        toast.error(errorMessage);
                                        console.error("Failed to delete customer", err.response || err); // Log detailed error
                                        onClose();
                                    }
                                }} // <<< END OF MODIFICATION
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            }
        });
    };

    // ... (rest of the code in AdminCustomerPage.js) ...

    const handleStatusChange = async (email, newStatus) => {
        try {
            await api.put(`/admin/update-user/${email}`, { status: newStatus });
            fetchCustomers(); // Refresh the list after status change
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditForm({ ...user });
        setEditFormErrors({});
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });

        // Clear error for this field when user starts typing
        if (editFormErrors[e.target.name]) {
            setEditFormErrors({
                ...editFormErrors,
                [e.target.name]: ''
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
            fetchCustomers(); // Refresh the list after edit
        } catch (err) {
            console.error("Failed to update customer", err);
            toast.error('Failed to update customer', {
                style: {
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    fontWeight: 'bold',
                },
            });
        }
    };

    const handleAddUserChange = (e) => {
        setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });

        // Clear error for this field when user starts typing
        if (formErrors[e.target.name]) {
            setFormErrors({
                ...formErrors,
                [e.target.name]: ''
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
            toast.success('Customer created successfully!', {
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
                role: 'customer',
                address: '',
                city: '',
                district: '',
            });
            setFormErrors({});
            fetchCustomers(); // Refresh the list after adding
        } catch (err) {
            setAddUserError('Failed to create customer.');
            console.error(err);
        }
    };

    const filteredCustomers = customers.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
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
                    <p>Loading customer data...</p>
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
                <AdminLayout active="customers"></AdminLayout>

                <div className="admin-content">
                    <div className="page-header">

                        <div className="header-actions">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-orange btn-add-user"
                            >
                                <i className="add-icon"></i>
                                Add New Customer
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
                                    placeholder="Search by name or email..."
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="user-content">
                            <div className="user-table-container">
                                {filteredCustomers.length > 0 ? (
                                    <table className="user-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCustomers.map(user => (
                                                <tr key={user.email} className="user-row">
                                                    <td className="user-name">{user.name}</td>
                                                    <td className="user-email">{user.email}</td>
                                                    <td>
                                                        <span className={`status-badge ${getStatusClass(user.accountStatus)}`}>
                                                            {user.accountStatus || 'ACTIVE'}
                                                        </span>
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
                                                                <button
                                                                    onClick={() => handleStatusChange(user.email, 'ACTIVE')}
                                                                    className="status-option status-active"
                                                                    style={{ color: 'green' }}
                                                                >
                                                                    Activate
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(user.email, 'SUSPENDED')}
                                                                    className="status-option status-suspended"
                                                                    style={{ color: 'orange' }}
                                                                >
                                                                    Suspend
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(user.email, 'BANNED')}
                                                                    className="status-option status-banned"
                                                                    style={{ color: 'red' }}
                                                                >
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
                                        <p className="no-data">No customers found matching your search criteria</p>
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
                            <h3>Edit Customer: {editForm.name}</h3>
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
                            <h3>Add New Customer</h3>
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

                                {addUserError && <p className="error-message">{addUserError}</p>}

                                <div className="modal-footer">
                                    <button type="submit" className="btn-orange btn-save">Save Customer</button>
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

export default AdminCustomerPage;