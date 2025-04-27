import React, { useEffect, useState } from 'react';
import api from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/admin.css';
import AdminLayout from './AdminLayout';

const AdminCustomerPage = () => {
    const [customers, setCustomers] = useState([]);
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
        role: 'customer',
        address: '',
        city: '',
        district: '',
    });
    const [addUserError, setAddUserError] = useState('');

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

    const handleDelete = async (email) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.delete(`/admin/delete-user/${email}`);
                fetchCustomers(); // Refresh the list after deletion
            } catch (err) {
                console.error("Failed to delete customer", err);
            }
        }
    };

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
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const saveEdit = async () => {
        try {
            await api.put(`/admin/update-user/${selectedUser.email}`, editForm);
            alert("Customer updated successfully.");
            setSelectedUser(null);
            fetchCustomers(); // Refresh the list after edit
        } catch (err) {
            console.error("Failed to update customer", err);
        }
    };

    const handleAddUserChange = (e) => {
        setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    };

    const submitAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', addUserForm);
            alert('Customer created successfully.');
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
            <Header />
            <div className="admin-dashboard">
                <AdminLayout active="customers"></AdminLayout>

                <div className="admin-content">
                    <div className="page-header">
                        <h1>Customer Management</h1>
                        <div className="header-actions">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-add-user"
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
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setSelectedUser(null)} className="btn-cancel">Cancel</button>
                            <button onClick={saveEdit} className="btn-save">Save Changes</button>
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

                                {addUserError && <p className="error-message">{addUserError}</p>}

                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-cancel">Cancel</button>
                                    <button type="submit" className="btn-save">Save Customer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomerPage;