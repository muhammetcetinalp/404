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

const AdminAdminPage = () => {
    const [admins, setAdmins] = useState([]);
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
        role: 'admin'
    });
    const [addUserError, setAddUserError] = useState('');

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admin/all-users');
            setAdmins(res.data.admins || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch admins", err);
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
        fetchAdmins();
    }, []);

    const handleDelete = async (email) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="custom-ui">
                        <div className="custom-ui-icon">
                            <FontAwesomeIcon icon={faTrash} />
                        </div>
                        <h1>Delete Admin</h1>
                        <p>Are you sure you want to delete this admin?</p>
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
                                        fetchAdmins(); // Refresh the list after deletion
                                        onClose();
                                    } catch (err) {
                                        console.error("Failed to delete admin", err);
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
            fetchAdmins(); // Refresh the list after edit
        } catch (err) {
            console.error("Failed to update admin", err);
        }
    };

    const handleAddUserChange = (e) => {
        setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    };

    const submitAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/add-admin', addUserForm);
            toast.success('Admin created successfully!', {
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
                role: 'admin'
            });
            fetchAdmins(); // Refresh the list after adding
        } catch (err) {
            setAddUserError('Failed to create admin.');
            console.error(err);
        }
    };

    const filteredAdmins = admins.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-app-container">
                <Header />
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Loading admin data...</p>
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
                <AdminLayout active="admins"></AdminLayout>

                <div className="admin-content">
                    <div className="page-header">

                        <div className="header-actions">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-orange btn-add-user"
                            >
                                <i className="add-icon"></i>
                                Add New Admin
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
                                {filteredAdmins.length > 0 ? (
                                    <table className="user-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAdmins.map(user => (
                                                <tr key={user.email} className="user-row">
                                                    <td className="user-name">{user.name}</td>
                                                    <td className="user-email">{user.email}</td>
                                                    <td className="user-actions">
                                                        <button onClick={() => openEditModal(user)} className="btn-edit">
                                                            <i className="edit-icon"></i>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(user.email)} className="btn-delete">
                                                            <i className="delete-icon"></i>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="no-data-container">
                                        <p className="no-data">No admins found matching your search criteria</p>
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
                            <h3>Edit Admin: {editForm.name}</h3>
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
                            <h3>Add New Admin</h3>
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

                                    <button type="submit" className="btn-orange btn-save">Save Admin</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAdminPage;