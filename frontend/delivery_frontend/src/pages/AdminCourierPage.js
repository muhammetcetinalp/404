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

const AdminCourierPage = () => {
    const [couriers, setCouriers] = useState([]);
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
        role: 'courier'
    });
    const [addUserError, setAddUserError] = useState('');

    const fetchCouriers = async () => {
        try {
            const res = await api.get('/admin/all-users');
            setCouriers(res.data.couriers || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch couriers", err);
            setLoading(false);
        }
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
    useEffect(() => {
        fetchCouriers();
    }, []);

    const handleDelete = async (email) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="custom-ui">
                        <div className="custom-ui-icon">
                            <FontAwesomeIcon icon={faTrash} />
                        </div>
                        <h1>Delete Courier</h1>
                        <p>Are you sure you want to delete this courier?</p>
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
                                        fetchCouriers(); // Refresh the list after deletion
                                        onClose();
                                    } catch (err) {
                                        console.error("Failed to delete courier", err);
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

    const handleStatusChange = async (email, newStatus) => {
        try {
            await api.put(`/admin/update-user/${email}`, { status: newStatus });
            fetchCouriers(); // Refresh the list after status change
        } catch (err) {
            console.error("Failed to update status", err);
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
            fetchCouriers(); // Refresh the list after edit
        } catch (err) {
            console.error("Failed to update courier", err);
        }
    };

    const handleAddUserChange = (e) => {
        setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    };

    const submitAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', addUserForm);
            toast.success('Courier created successfully!', {
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
                role: 'courier'
            });
            fetchCouriers(); // Refresh the list after adding
        } catch (err) {
            setAddUserError('Failed to create courier.');
            console.error(err);
        }
    };

    const filteredCouriers = couriers.filter(u =>
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
                    <p>Loading courier data...</p>
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
                <AdminLayout active="couriers"></AdminLayout>

                <div className="admin-content">
                    <div className="page-header">

                        <div className="header-actions">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-orange btn-add-user"
                            >
                                <i className="add-icon"></i>
                                Add New Courier
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
                                {filteredCouriers.length > 0 ? (
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
                                            {filteredCouriers.map(user => (
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
                                        <p className="no-data">No couriers found matching your search criteria</p>
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
                            <h3>Edit Courier: {editForm.name}</h3>
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
                            <h3>Add New Courier</h3>
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

                                {addUserError && <p className="error-message">{addUserError}</p>}

                                <div className="modal-footer">

                                    <button type="submit" className="btn-orange btn-save">Save Courier</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourierPage;