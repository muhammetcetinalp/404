import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/admin.css';
import AdminLayout from './AdminLayout';
import AddUserModal from '../components/AddUserModal';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        customers: 0,
        restaurants: 0,
        couriers: 0,
        orders: 0,
        newOrders: 0,
        totalRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app, these would be separate endpoints or a single dashboard endpoint
                const statsData = await api.get('/admin/dashboard/stats');
                const recentOrdersData = await api.get('/admin/dashboard/recent-orders');

                setStats(statsData.data);
                setRecentOrders(recentOrdersData.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const refreshDashboardData = async () => {
        try {
            const statsData = await api.get('/admin/dashboard/stats');
            setStats(statsData.data);
        } catch (err) {
            console.error("Failed to refresh stats data", err);
        }
    };

    if (loading) {
        return (
            <div className="admin-app-container">
                <Header />
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="admin-app-container">
            <Header />
            <div className="admin-dashboard">
                <AdminLayout active="dashboard"></AdminLayout>

                <div className="admin-content ">

                    <div className="admin-stats-grid">
                        <div className="admin-stat-card">
                            <div className="stat-icon customers-icon"></div>
                            <div className="stat-info">
                                <h3>Customers</h3>
                                <p className="stat-value">{stats.customers}</p>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="stat-icon restaurants-icon"></div>
                            <div className="stat-info">
                                <h3>Restaurants</h3>
                                <p className="stat-value">{stats.restaurants}</p>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="stat-icon couriers-icon"></div>
                            <div className="stat-info">
                                <h3>Couriers</h3>
                                <p className="stat-value">{stats.couriers}</p>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="stat-icon orders-icon"></div>
                            <div className="stat-info">
                                <h3>Total Orders</h3>
                                <p className="stat-value">{stats.orders}</p>
                            </div>
                        </div>

                        <div className="admin-stat-card highlight">
                            <div className="stat-icon revenue-icon"></div>
                            <div className="stat-info">
                                <h3>Total Revenue</h3>
                                <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-content-grid">
                        <div className="admin-card recent-orders">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h2 className="mb-0">Recent Orders</h2>
                                <button
                                    onClick={() => handleNavigate('/admin/orders')}
                                    className="btn btn-sm btn-outline-secondary"
                                >
                                    View All
                                </button>
                            </div>

                            {recentOrders.length > 0 ? (
                                <div className="order-list">
                                    {recentOrders.map(order => (
                                        <div key={order.id} className="order-item">
                                            <div className="order-info">
                                                <h4>Order #{order.id}</h4>
                                                <p className="order-time">{new Date(order.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="order-details">
                                                <p className="order-restaurant">{order.restaurantName}</p>
                                                <p className="order-customer">{order.customerName}</p>
                                            </div>
                                            <div className="order-status">
                                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                                <p className="order-amount">${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No recent orders found</p>
                            )}
                        </div>

                        <div className="admin-card quick-actions">
                            <div className="card-header">
                                <h2>Quick Actions</h2>
                            </div>

                            <div className="action-grid">
                                <button onClick={() => setShowAddModal(true)} className="action-button">
                                    <i className="action-icon add-user-icon"></i>
                                    <span>Add User</span>
                                </button>

                                <button onClick={() => handleNavigate('/admin/add-restaurant')} className="action-button">
                                    <i className="action-icon add-restaurant-icon"></i>
                                    <span>Add Restaurant</span>
                                </button>

                                <button onClick={() => handleNavigate('/admin/view-reports')} className="action-button">
                                    <i className="action-icon view-reports-icon"></i>
                                    <span>View Reports</span>
                                </button>

                                <button onClick={() => handleNavigate('/admin/system-health')} className="action-button">
                                    <i className="action-icon system-health-icon"></i>
                                    <span>System Health</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Use the AddUserModal component */}
            <AddUserModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onUserAdded={refreshDashboardData}
            />
        </div>
    );
};

export default AdminDashboard;