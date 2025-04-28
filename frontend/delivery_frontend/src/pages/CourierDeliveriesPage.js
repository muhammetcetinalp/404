import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMotorcycle,
    faMapMarkerAlt,
    faUser,
    faCheckCircle,
    faBox,
    faTruck,
    faFilter,
    faPhone
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import '../styles/dashboard.css';
import '../styles/restaurant-dashboard.css';
import '../styles/order.css';
import '../styles/courier.css';
import { AccountStatusBanner, checkAccountStatus } from '../components/AccountStatusBanner';

const CourierDeliveriesPage = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('latest');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [activeTab, setActiveTab] = useState('IN_PROGRESS');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    // Get courier ID from token
    let courierId;
    try {
        const decoded = jwtDecode(token);
        courierId = decoded.id;
    } catch (error) {
        console.error("Error decoding token:", error);
    }

    // Map status to colors
    const statusColors = {
        "PENDING": "secondary",
        "IN_PROGRESS": "warning",
        "PICKED_UP": "primary",
        "DELIVERED": "success",
        "CANCELLED": "danger"
    };

    // Map status to display names
    const statusDisplayNames = {
        "PENDING": "Pending",
        "IN_PROGRESS": "Ready for Pickup",
        "PICKED_UP": "Out for Delivery",
        "DELIVERED": "Delivered",
        "CANCELLED": "Cancelled"
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Check account status (banned/suspended)
        if (!checkAccountStatus()) {
            return;
        }

        const fetchDeliveries = async () => {
            try {
                setLoading(true);

                // API'den verileri çek
                const response = await api.get('/courier/orders/assigned');

                if (response.data && Array.isArray(response.data)) {
                    setDeliveries(response.data);
                    applyFilters(response.data, sortOption, activeTab);
                } else {
                    throw new Error('Invalid data format');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching deliveries:', err);
                setError('Failed to load deliveries. Please try again later.');
                setLoading(false);




            }
        };

        fetchDeliveries();
    }, [token, navigate]);

    // Filter and sort deliveries
    const applyFilters = (allDeliveries, sort, status) => {
        let results = [...allDeliveries];

        // Filter by status if not "all"
        if (status !== 'all') {
            results = results.filter(delivery => delivery.orderStatus === status);
        }

        // Apply sorting
        switch (sort) {
            case 'latest':
                results.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                break;
            case 'oldest':
                results.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
                break;
            case 'highest':
                results.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'lowest':
                results.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
            default:
                break;
        }

        setFilteredDeliveries(results);
    };

    // Apply filters when options change
    useEffect(() => {
        applyFilters(deliveries, sortOption, activeTab);
    }, [sortOption, activeTab, deliveries]);

    // Toggle order details expansion
    const handleExpandOrder = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    // Update order status
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await api.patch(`/orders/status/${orderId}`, {
                status: newStatus
            });

            console.log("Status update response:", response.data);

            // Update local state
            const updatedDeliveries = deliveries.map(delivery => {
                if (delivery.orderId === orderId) {
                    return { ...delivery, orderStatus: newStatus };
                }
                return delivery;
            });

            setDeliveries(updatedDeliveries);
            applyFilters(updatedDeliveries, sortOption, activeTab);

        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status. Please try again.');
        }
    };

    // Format date for display
    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Render action buttons based on status
    const renderStatusButtons = (order) => {
        switch (order.orderStatus) {
            case 'IN_PROGRESS':
                return (
                    <button
                        className="btn btn-primary btn-sm mb-2 w-100"
                        onClick={() => handleUpdateStatus(order.orderId, 'PICKED_UP')}
                    >
                        <FontAwesomeIcon icon={faBox} className="mr-1" />
                        Mark as Picked Up
                    </button>
                );
            case 'PICKED_UP':
                return (
                    <button
                        className="btn btn-success btn-sm mb-2 w-100"
                        onClick={() => handleUpdateStatus(order.orderId, 'DELIVERED')}
                    >
                        <FontAwesomeIcon icon={faTruck} className="mr-1" />
                        Mark as Delivered
                    </button>
                );
            case 'DELIVERED':
                return (
                    <button
                        className="btn btn-secondary btn-sm mb-2 w-100"
                        disabled
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Completed
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container-fluid dashboard-header">
                <Header />
                <AccountStatusBanner />
                <div className="container dashboard-welcome-text">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="display-4 text-white">My Deliveries</h1>
                            <p className="lead text-white">
                                Manage your active deliveries and update their status
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-4" style={{ background: "#EBEDF3", flex: 1 }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row">
                        {/* Left Sidebar - Sort Options */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar rounded shadow-sm">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Sort By
                                </h5>

                                <div className="list-group">
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'latest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('latest')}
                                    >
                                        Latest First
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'oldest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('oldest')}
                                    >
                                        Oldest First
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'highest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('highest')}
                                    >
                                        Highest Price
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'lowest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('lowest')}
                                    >
                                        Lowest Price
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Orders */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 rounded shadow-sm">
                                {/* Status Tabs */}
                                <div className="card-header bg-white p-0 mb-4">
                                    <div className="order-tabs-container">
                                        <div
                                            className={`order-tab ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('IN_PROGRESS')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faBox} />
                                                <span className="order-tab-text">Ready for Pickup</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`order-tab ${activeTab === 'PICKED_UP' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('PICKED_UP')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faMotorcycle} />
                                                <span className="order-tab-text">Out for Delivery</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`order-tab ${activeTab === 'DELIVERED' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('DELIVERED')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                <span className="order-tab-text">Delivered</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`order-tab ${activeTab === 'all' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('all')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faFilter} />
                                                <span className="order-tab-text">All Orders</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading your deliveries...</p>
                                    </div>
                                ) : filteredDeliveries.length > 0 ? (
                                    <div className="order-list">
                                        {filteredDeliveries.map(order => (
                                            <div className="order-item mb-3" key={order.orderId}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-8">
                                                                <h5 className="card-title location-line">
                                                                    {order.restaurant?.name || "Restaurant"}
                                                                    <span className={`badge bg-${statusColors[order.orderStatus] || 'secondary'} text-white ml-2 p-2`}>
                                                                        {statusDisplayNames[order.orderStatus] || order.orderStatus}
                                                                    </span>
                                                                </h5>
                                                                <div className="mb-3">
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <div style={{ width: "20px" }}>
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger" />
                                                                        </div>
                                                                        <div className="ml-2">
                                                                            <strong>Pickup:</strong> {order.restaurant?.address || "Restaurant Address"}
                                                                            {order.restaurant?.phone && (
                                                                                <span className="ml-2">
                                                                                    <FontAwesomeIcon icon={faPhone} className="mr-1" />
                                                                                    {order.restaurant.phone}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <div style={{ width: "20px" }}>
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
                                                                        </div>
                                                                        <div className="ml-2">
                                                                            <strong>Delivery:</strong> {order.deliveryAddress}
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex align-items-center">
                                                                        <div style={{ width: "20px" }}>
                                                                            <FontAwesomeIcon icon={faUser} />
                                                                        </div>
                                                                        <div className="ml-2">
                                                                            <strong>Customer:</strong> {order.customer?.name || "Customer"}
                                                                            {order.customer?.phone && (
                                                                                <span className="ml-2">
                                                                                    <FontAwesomeIcon icon={faPhone} className="mr-1" />
                                                                                    {order.customer.phone}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="card-text">
                                                                    <strong>Order Time:</strong> {formatDateTime(order.orderDate)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-4 text-right">
                                                                <h5 className="text-warning mb-3">₺{order.totalAmount.toFixed(2)}</h5>
                                                                {renderStatusButtons(order)}
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm w-100"
                                                                    onClick={() => handleExpandOrder(order.orderId)}
                                                                >
                                                                    {expandedOrderId === order.orderId ? 'Hide Details' : 'View Details'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedOrderId === order.orderId && (
                                                        <div className="card-footer order-details-section">
                                                            <h6 className="mb-3">Order Items</h6>
                                                            <div>
                                                                <table className="table table-sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Item</th>
                                                                            <th style={{ width: "80px" }}>Quantity</th>
                                                                            <th style={{ width: "120px" }} className="text-right">Price</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {Object.entries(order.items || {}).map(([itemKey, quantity], index) => {
                                                                            try {
                                                                                const item = JSON.parse(itemKey);
                                                                                return (
                                                                                    <tr key={index}>
                                                                                        <td>{item.name}</td>
                                                                                        <td className="text-center">{quantity}</td>
                                                                                        <td className="text-right">₺{(item.price * quantity).toFixed(2)}</td>
                                                                                    </tr>
                                                                                );
                                                                            } catch (e) {
                                                                                console.error("Error parsing item:", e);
                                                                                return null;
                                                                            }
                                                                        })}
                                                                        <tr className="table-active font-weight-bold">
                                                                            <td colSpan="2">Total</td>
                                                                            <td className="text-right">₺{order.totalAmount.toFixed(2)}</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faMotorcycle} size="3x" className="text-muted mb-3" />
                                        <h5>No {statusDisplayNames[activeTab] || activeTab} deliveries</h5>
                                        <p>You don't have any {statusDisplayNames[activeTab]?.toLowerCase() || activeTab} deliveries at the moment.</p>
                                        <button className="btn btn-warning" onClick={() => navigate('/courier-dashboard')}>
                                            Find Available Orders
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CourierDeliveriesPage;