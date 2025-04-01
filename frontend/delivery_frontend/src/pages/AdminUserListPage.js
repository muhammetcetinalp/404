import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/all-users');
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (email) => {
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

    const renderUsers = (users, roleLabel, badgeColor) => (
        <>
            <h3 style={{ marginTop: '30px' }}>{roleLabel}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredUsers(users).map(user => (
                    <div key={user.email} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        padding: '15px 20px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                            <div style={{ fontSize: '14px', color: '#555' }}>{user.email}</div>
                            <span style={{
                                fontSize: '11px',
                                backgroundColor: badgeColor,
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                marginTop: '5px',
                                display: 'inline-block',
                                textTransform: 'uppercase'
                            }}>{user.role}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => openEditModal(user)} style={{
                                backgroundColor: '#ffc107',
                                color: 'black',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}>
                                Edit
                            </button>
                            <button onClick={() => handleDelete(user.email)} style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: 'auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>All Users</h2>
            <button
                onClick={() => navigate('/admin/add-user')}
                style={{
                    marginBottom: '20px',
                    padding: '10px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '15px',
                    cursor: 'pointer'
                }}
            >
                Add New User
            </button>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or role (e.g. customer)"
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    marginBottom: '20px'
                }}
            />

            {renderUsers(data.customers, 'Customers', '#28a745')}
            {renderUsers(data.couriers, 'Couriers', '#007bff')}
            {renderUsers(data.restaurantOwners, 'Restaurant Owners', '#ffc107')}
            {renderUsers(data.admins, 'Admins', '#6f42c1')}

            <button
                onClick={() => navigate('/admin')}
                style={{
                    marginTop: '40px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Back to Dashboard
            </button>

            {/* Edit Modal */}
            {selectedUser && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 999
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '10px',
                        width: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <h3>Edit User</h3>
                        <select name="role" value={editForm.role} disabled style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f1f1f1' }}>
                            <option value="customer">Customer</option>
                            <option value="courier">Courier</option>
                            <option value="restaurant_owner">Restaurant Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                        <input name="name" value={editForm.name || ''} onChange={handleEditChange} placeholder="Name" />
                        <input name="phone" value={editForm.phone || ''} onChange={handleEditChange} placeholder="Phone" />
                        {editForm.role !== 'courier' && (
                            <>
                                <input name="city" value={editForm.city || ''} onChange={handleEditChange} placeholder="City" />
                                <input name="district" value={editForm.district || ''} onChange={handleEditChange} placeholder="District" />
                                <input name="address" value={editForm.address || ''} onChange={handleEditChange} placeholder="Address" />
                            </>
                        )}
                        {editForm.role === 'restaurant_owner' && (
                            <>
                                <input name="businessHoursStart" value={editForm.businessHoursStart || ''} onChange={handleEditChange} placeholder="Opening Hour" />
                                <input name="businessHoursEnd" value={editForm.businessHoursEnd || ''} onChange={handleEditChange} placeholder="Closing Hour" />
                            </>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setSelectedUser(null)} style={{ padding: '6px 12px' }}>Cancel</button>
                            <button onClick={saveEdit} style={{ backgroundColor: '#28a745', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '5px' }}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserListPage;
