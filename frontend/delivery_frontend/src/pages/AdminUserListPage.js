import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/admin.css';
import AdminLayout from './AdminLayout';
import AddUserModal from '../components/AddUserModal';

const AdminUserListPage = () => {
    const [data, setData] = useState({
        customers: [],
        couriers: [],
        restaurantOwners: [],
        admins: []
    });
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('customers');
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/all-users');
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (email) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/admin/delete-user/${email}`);
                setData(prev => ({
                    customers: prev.customers.filter(u => u.email !== email),
                    couriers: prev.couriers.filter(u => u.email !== email),
                    restaurantOwners: prev.restaurantOwners.filter(u => u.email !== email),
                    admins: prev.admins.filter(u => u.email !== email)
                }));
            } catch (err) {
                console.error("Failed to delete user", err);
            }
        }
    };

    const handleStatusChange = async (email, newStatus) => {
        try {
            await api.put(`/admin/update-user/${email}`, { status: newStatus });
            const res = await api.get('/admin/all-users');
            setData(res.data);
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
            alert("User updated successfully.");
            setSelectedUser(null);
            const res = await api.get('/admin/all-users');
            setData(res.data);
        } catch (err) {
            console.error("Failed to update user", err);
        }
    };

    const filteredUsers = (users) =>
        users ? users.filter(u =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.role?.toLowerCase().includes(search.toLowerCase())
        ) : [];

    const getStatusClass = (status) => {
        if (!status) return '';
        switch (status.toLowerCase()) {
            case 'active': return 'status-active';
            case 'suspended': return 'status-suspended';
            case 'banned': return 'status-banned';
            default: return '';
        }
    };

    const renderUserTable = (users, allowStatusChange = true) => (
        <div className="user-table-container">
            {filteredUsers(users).length > 0 ? (
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
                        {filteredUsers(users).map(user => (
                            <tr key={user.email} className="user-row">
                                <td className="user-name">{user.name}</td>
                                <td className="user-email">{user.email}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                                        {user.status || 'N/A'}
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
                                    {allowStatusChange && (
                                        <div className="status-dropdown">
                                            <button className="btn-status">Status ▼</button>
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
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="no-data-container">
                    <p className="no-data">No users found matching your search criteria</p>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="admin-app-container">
                <Header />
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Loading user data...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'customers':
                return renderUserTable(data.customers, true);
            case 'couriers':
                return renderUserTable(data.couriers, true);
            case 'restaurant_owners':
                return renderUserTable(data.restaurantOwners, true);
            case 'admins':
                return renderUserTable(data.admins, false);
            default:
                return renderUserTable(data.customers, true);
        }
    };

    return (
        <div className="admin-app-container">
            <Header />
            <div className="admin-dashboard">
                <AdminLayout active="users"></AdminLayout>

                <div className="admin-content">


                    <div className="admin-card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="search-container">
                                <i className="search-icon"></i>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, email or role..."
                                    className="search-input"
                                />
                            </div>

                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-add-user"
                            >
                                <i className="add-icon"></i>
                                Add New User
                            </button>

                        </div>

                        <div className="user-tabs">
                            <button
                                className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
                                onClick={() => setActiveTab('customers')}
                            >
                                Customers ({data.customers?.length || 0})
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'couriers' ? 'active' : ''}`}
                                onClick={() => setActiveTab('couriers')}
                            >
                                Couriers ({data.couriers?.length || 0})
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'restaurant_owners' ? 'active' : ''}`}
                                onClick={() => setActiveTab('restaurant_owners')}
                            >
                                Restaurant Owners ({data.restaurantOwners?.length || 0})
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
                                onClick={() => setActiveTab('admins')}
                            >
                                Admins ({data.admins?.length || 0})
                            </button>
                        </div>

                        <div className="user-content">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit User: {editForm.name}</h3>
                            <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={editForm.role}
                                    disabled
                                    className="form-control disabled"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="courier">Courier</option>
                                    <option value="restaurant_owner">Restaurant Owner</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
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
                            {editForm.role !== 'courier' && (
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
                            )}
                            {editForm.role !== 'courier' && (
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
                            )}
                            {editForm.role === 'restaurant_owner' && (
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Opening Hour</label>
                                        <input
                                            name="businessHoursStart"
                                            value={editForm.businessHoursStart || ''}
                                            onChange={handleEditChange}
                                            placeholder="Opening Hour"
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Closing Hour</label>
                                        <input
                                            name="businessHoursEnd"
                                            value={editForm.businessHoursEnd || ''}
                                            onChange={handleEditChange}
                                            placeholder="Closing Hour"
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setSelectedUser(null)} className="btn-cancel">Cancel</button>
                            <button onClick={saveEdit} className="btn-save">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Use the AddUserModal component */}
            <AddUserModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onUserAdded={fetchUsers}
            />
        </div>
    );
};

export default AdminUserListPage;