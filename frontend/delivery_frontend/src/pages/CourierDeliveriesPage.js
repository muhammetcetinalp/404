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
    faPhone,
    faClipboardList,
    faArrowLeft,
    faSync,
    faCalendar
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [activeTab, setActiveTab] = useState('CURRENT'); // CURRENT, COMPLETED, ALL
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    // Get courier ID from JWT token
    let courierId;
    try {
        const decoded = jwtDecode(token);
        courierId = decoded.id;
    } catch (error) {
        console.error("JWT decode error:", error);
    }

    const fetchDeliveries = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (!checkAccountStatus()) {
            return;
        }

        try {
            setLoading(true);
            if (refreshing) setRefreshing(true);

            // Fetch all assigned deliveries
            const response = await api.get('/courier/orders/assigned');

            if (response.data && Array.isArray(response.data)) {
                setDeliveries(response.data);
            } else {
                setDeliveries([]);
            }
        } catch (err) {
            console.error('Error fetching deliveries:', err);
            setError('Failed to load your deliveries. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, [token, navigate]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDeliveries();
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/courier/orders/update-status/${orderId}`, newStatus, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Update local state
            setDeliveries(prevDeliveries =>
                prevDeliveries.map(delivery =>
                    delivery.orderId === orderId
                        ? { ...delivery, orderStatus: newStatus }
                        : delivery
                )
            );

            // Show success notification
            alert(`Order status updated to ${newStatus.replace('_', ' ')}`);
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update order status.');
        }
    };

    const handleExpandOrder = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter deliveries based on active tab
    const filteredDeliveries = deliveries.filter(delivery => {
        if (activeTab === 'CURRENT') {
            return ['IN_PROGRESS', 'PICKED_UP'].includes(delivery.orderStatus);
        } else if (activeTab === 'COMPLETED') {
            return delivery.orderStatus === 'DELIVERED';
        }
        return true; // ALL tab
    });

    // Sort deliveries - most recent first
    const sortedDeliveries = [...filteredDeliveries].sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
    );

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_PROGRESS': return 'warning';
            case 'PICKED_UP': return 'primary';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    // Render action button based on status
    const renderActionButton = (order) => {
        switch (order.orderStatus) {
            case 'IN_PROGRESS':
                return (
                    <button
                        className="btn btn-warning w-100"
                        onClick={() => handleUpdateStatus(order.orderId, 'PICKED_UP')}
                    >
                        <FontAwesomeIcon icon={faBox} className="mr-2" /> Mark as Picked Up
                    </button>
                );
            case 'PICKED_UP':
                return (
                    <button
                        className="btn btn-success w-100"
                        onClick={() => handleUpdateStatus(order.orderId, 'DELIVERED')}
                    >
                        <FontAwesomeIcon icon={faTruck} className="mr-2" /> Mark as Delivered
                    </button>
                );
            case 'DELIVERED':
                return (
                    <button className="btn btn-outline-success w-100" disabled>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Delivered
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="courier-delivery-page d-flex flex-column min-vh-100">
            <div className="container-fluid dashboard-header">
                <Header />
                <AccountStatusBanner />
                <div className="container dashboard-welcome-text">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="display-4 text-white">
                                <FontAwesomeIcon icon={faMotorcycle} className="mr-3" />
                                My Deliveries
                            </h1>
                            <p className="lead text-white">
                                Track and manage your accepted orders
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid bg-light py-4 flex-grow-1">
                <div className="container">
                    {/* Navigation and Actions */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate('/')}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Back to Dashboard
                        </button>

                        <div className="btn-group">
                            <button
                                className={`btn ${activeTab === 'CURRENT' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveTab('CURRENT')}
                            >
                                Current
                            </button>
                            <button
                                className={`btn ${activeTab === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => setActiveTab('COMPLETED')}
                            >
                                Completed
                            </button>
                            <button
                                className={`btn ${activeTab === 'ALL' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={() => setActiveTab('ALL')}
                            >
                                All
                            </button>
                        </div>

                        <button
                            className="btn btn-outline-warning"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <FontAwesomeIcon icon={faSync} className={`mr-2 ${refreshing ? 'fa-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Error message */}
                    {error && <div className="alert alert-danger mb-4">{error}</div>}

                    {/* Deliveries list */}
                    {loading && !refreshing ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p className="mt-3">Loading your deliveries...</p>
                        </div>
                    ) : sortedDeliveries.length > 0 ? (
                        <div className="row">
                            {sortedDeliveries.map(order => (
                                <div className="col-lg-6 mb-4" key={order.orderId}>
                                    <div className={`card delivery-card border-${getStatusColor(order.orderStatus)} h-100`}>
                                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                            <h5 className="m-0">
                                                Order #{order.orderId.substring(order.orderId.length - 6)}
                                            </h5>
                                            <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="card-body">
                                            <div className="mb-3">
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faCalendar} className="text-muted mr-2" />
                                                    {formatDateTime(order.orderDate)}
                                                </p>
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger mr-2" />
                                                    <strong>Restaurant:</strong> {order.restaurant?.name || "Restaurant"}
                                                </p>
                                                <p className="mb-2">
                                                    <FontAwesomeIcon icon={faUser} className="text-primary mr-2" />
                                                    <strong>Customer:</strong> {order.customer?.name || "Customer"}
                                                </p>
                                                <p className="mb-0">
                                                    <strong>Delivery to:</strong> {order.deliveryAddress}
                                                </p>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="text-warning mb-0">₺{order.totalAmount?.toFixed(2)}</h5>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => handleExpandOrder(order.orderId)}
                                                >
                                                    {expandedOrderId === order.orderId ? 'Hide Details' : 'View Items'}
                                                </button>
                                            </div>

                                            {expandedOrderId === order.orderId && (
                                                <div className="mt-3">
                                                    <hr />
                                                    <h6 className="mb-3">Order Items</h6>
                                                    <div className="table-responsive">
                                                        <table className="table table-sm">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>Item</th>
                                                                    <th className="text-center">Qty</th>
                                                                    <th className="text-right">Price</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items && Object.entries(order.items).map(([item, qty], idx) => {
                                                                    try {
                                                                        const parsedItem = JSON.parse(item);
                                                                        return (
                                                                            <tr key={idx}>
                                                                                <td>{parsedItem.name}</td>
                                                                                <td className="text-center">{qty}</td>
                                                                                <td className="text-right">₺{(parsedItem.price * qty).toFixed(2)}</td>
                                                                            </tr>
                                                                        );
                                                                    } catch (e) {
                                                                        return null;
                                                                    }
                                                                })}
                                                                <tr className="table-active">
                                                                    <td colSpan="2"><strong>Total</strong></td>
                                                                    <td className="text-right"><strong>₺{order.totalAmount?.toFixed(2)}</strong></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-footer bg-white">
                                            {renderActionButton(order)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5 bg-white rounded shadow-sm">
                            <FontAwesomeIcon icon={faClipboardList} size="3x" className="text-muted mb-3" />
                            <h5>No deliveries found</h5>
                            <p className="text-muted">
                                {activeTab === 'CURRENT'
                                    ? "You don't have any active deliveries right now."
                                    : activeTab === 'COMPLETED'
                                        ? "You haven't completed any deliveries yet."
                                        : "You don't have any deliveries in your history."}
                            </p>
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => navigate('/')}
                            >
                                <FontAwesomeIcon icon={faMotorcycle} className="mr-2" />
                                Find New Orders
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CourierDeliveriesPage;