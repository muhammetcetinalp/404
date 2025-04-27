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
                                        fetchRestaurants(); // Refresh the list after deletion
                                        onClose();
                                    } catch (err) {
                                        console.error("Failed to delete restaurant", err);
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
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const saveEdit = async () => {
        try {
            await api.put(`/admin/update-user/${selectedUser.email}`, editForm);
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
        }
    };

    const handleAddUserChange = (e) => {
        setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    };

    const submitAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', addUserForm);
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
                                                                className="btn-approve"
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
                                                                <button onClick={() => handleStatusChange(user.email, 'SUSPENDED')} className="status-option status-suspended">
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
                                    className="form-control"
                                />
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
                                <label>Phone</label>
                                <input
                                    name="phone"
                                    value={editForm.phone || ''}
                                    onChange={handleEditChange}
                                    placeholder="Phone"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>City</label>
                                    <input
                                        name="city"
                                        value={editForm.city || ''}
                                        onChange={handleEditChange}
                                        placeholder="City"
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group half">
                                    <label>District</label>
                                    <input
                                        name="district"
                                        value={editForm.district || ''}
                                        onChange={handleEditChange}
                                        placeholder="District"
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={editForm.address || ''}
                                    onChange={handleEditChange}
                                    placeholder="Address"
                                    className="form-control textarea"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Opening Hour</label>
                                    <input
                                        name="businessHoursStart"
                                        value={editForm.businessHoursStart || ''}
                                        onChange={handleEditChange}
                                        placeholder="Opening Hour (e.g. 09:00)"
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group half">
                                    <label>Closing Hour</label>
                                    <input
                                        name="businessHoursEnd"
                                        value={editForm.businessHoursEnd || ''}
                                        onChange={handleEditChange}
                                        placeholder="Closing Hour (e.g. 22:00)"
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cuisine Type</label>
                                <input
                                    name="cuisineType"
                                    value={editForm.cuisineType || ''}
                                    onChange={handleEditChange}
                                    placeholder="e.g. Italian, Turkish"
                                    className="form-control"
                                />
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
                                </div>
                                <div className="form-group">
                                    <label>Cuisine Type</label>
                                    <input
                                        name="cuisineType"
                                        value={addUserForm.cuisineType}
                                        onChange={handleAddUserChange}
                                        placeholder="e.g. Italian, Turkish"
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
        </div>
    );
};

export default AdminRestaurantPage;