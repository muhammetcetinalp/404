import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faUtensils, faTruck, faUserPlus,
    faStoreAlt, faUserCog, faCheckCircle, faTimesCircle,
    faEnvelope, faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/admin.css';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        customers: 0,
        restaurants: 0,
        couriers: 0
    });
    const [loading, setLoading] = useState(true);
    const [pendingRestaurants, setPendingRestaurants] = useState([]);

    // Get admin name from localStorage
    const adminName = localStorage.getItem('name') || 'Admin';
    const adminInitial = adminName.charAt(0).toUpperCase();

    const fetchDashboardData = async () => {
        try {
            // Use the all-users endpoint that exists in the backend
            const allUsersRes = await api.get('/admin/all-users');

            if (allUsersRes.data) {
                // Calculate stats from available data
                const customers = allUsersRes.data.customers || [];
                const restaurantOwners = allUsersRes.data.restaurantOwners || [];
                const couriers = allUsersRes.data.couriers || [];

                // Get only approved restaurants for the counter
                const approvedRestaurants = restaurantOwners.filter(r => r.approved === true);

                // Filter restaurant owners that are pending approval
                const pending = restaurantOwners.filter(r => r.approved === false);

                // Update stats with actual counts from the API response
                setStats({
                    customers: customers.length,
                    restaurants: approvedRestaurants.length, // Only count approved restaurants
                    couriers: couriers.length
                });

                setPendingRestaurants(pending);
            }

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleApproveRestaurant = async (restaurantId) => {
        try {
            // This endpoint would need to be implemented in your backend
            await api.post(`/admin/approve-restaurant/${restaurantId}`);
            alert('Restaurant approved successfully');
            // Refresh data
            fetchDashboardData();
        } catch (error) {
            console.error("Failed to approve restaurant", error);
            alert('Failed to approve restaurant');
        }
    };

    const handleRejectRestaurant = async (restaurantId) => {
        if (window.confirm('Are you sure you want to reject this restaurant?')) {
            try {
                // This endpoint would need to be implemented in your backend
                await api.post(`/admin/reject-restaurant/${restaurantId}`);
                alert('Restaurant rejected successfully');
                // Refresh data
                fetchDashboardData();
            } catch (error) {
                console.error("Failed to reject restaurant", error);
                alert('Failed to reject restaurant');
            }
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

                <div className="admin-content">
                    <div className="admin-header">


                    </div>

                    <div className="admin-stats-grid">
                        <div className="admin-stat-card">
                            <div className="stat-icon customers-icon">
                                <FontAwesomeIcon icon={faUsers} size="2x" />
                            </div>
                            <div className="stat-info">
                                <h3>Customers</h3>
                                <p className="stat-value">{stats.customers || 0}</p>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="stat-icon restaurants-icon">
                                <FontAwesomeIcon icon={faUtensils} size="2x" />
                            </div>
                            <div className="stat-info">
                                <h3>Restaurants</h3>
                                <p className="stat-value">{stats.restaurants || 0}</p>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="stat-icon couriers-icon">
                                <FontAwesomeIcon icon={faTruck} size="2x" />
                            </div>
                            <div className="stat-info">
                                <h3>Couriers</h3>
                                <p className="stat-value">{stats.couriers || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="admin-content-grid">
                        <div className="admin-card pending-restaurants">
                            <div className="card-header">
                                <h2>Pending Restaurant Approvals</h2>
                            </div>

                            {pendingRestaurants && pendingRestaurants.length > 0 ? (
                                <div className="restaurant-approval-list">
                                    {pendingRestaurants.map(restaurant => (
                                        <div key={restaurant.restaurantId} className="restaurant-approval-item">
                                            <div className="restaurant-info">
                                                <h4 className="restaurant-name">{restaurant.name}</h4>
                                                <div className="restaurant-details">
                                                    <p className="restaurant-email">
                                                        <FontAwesomeIcon icon={faEnvelope} />
                                                        {restaurant.email}
                                                    </p>
                                                    <p className="restaurant-address">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                        {restaurant.address}, {restaurant.city}
                                                    </p>
                                                    <p className="restaurant-cuisine">
                                                        <FontAwesomeIcon icon={faUtensils} />
                                                        Cuisine: {restaurant.cuisineType || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="restaurant-approval-actions">
                                                <button
                                                    onClick={() => handleApproveRestaurant(restaurant.restaurantId)}
                                                    className="btn-approve"
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRestaurant(restaurant.restaurantId)}
                                                    className="btn-reject"
                                                >
                                                    <FontAwesomeIcon icon={faTimesCircle} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data-container">
                                    <p className="no-data">No pending restaurant approvals</p>
                                </div>
                            )}
                        </div>

                        <div className="admin-card quick-actions">
                            <div className="card-header">
                                <h2>Quick Actions</h2>
                            </div>

                            <div className="action-grid">
                                <button onClick={() => navigate('/admin/customers')} className="action-button">
                                    <FontAwesomeIcon icon={faUserPlus} className="action-icon" />
                                    <span>Add Customer</span>
                                </button>
                                <button onClick={() => navigate('/admin/restaurants')} className="action-button">
                                    <FontAwesomeIcon icon={faStoreAlt} className="action-icon" />
                                    <span>Add Restaurant</span>
                                </button>
                                <button onClick={() => navigate('/admin/couriers')} className="action-button">
                                    <FontAwesomeIcon icon={faTruck} className="action-icon" />
                                    <span>Add Courier</span>
                                </button>
                                <button onClick={() => navigate('/admin/admin-users')} className="action-button">
                                    <FontAwesomeIcon icon={faUsers} className="action-icon" />
                                    <span>Add Admin</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;