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
    faCalendar,
    faChevronDown,
    faChevronUp,
    faClock
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourierDeliveriesPage = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [activeTab, setActiveTab] = useState('CURRENT'); // CURRENT, COMPLETED, ALL
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();
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
            // Send the status as a string value, not a JSON object
            await api.patch(`/courier/orders/update-status/${orderId}`, { status: newStatus }, {
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
            toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update order status.');
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

    // Calculate total price of items
    const calculateItemsTotal = (items) => {
        if (!items || typeof items !== 'object') return 0;
        return Object.entries(items).reduce((total, [itemKey, quantity]) => {
            try {
                const item = JSON.parse(itemKey);
                return total + (item.price * quantity);
            } catch (e) {
                console.error('Error parsing item in total calculation:', e);
                return total;
            }
        }, 0);
    };

    // Calculate courier's earnings from the order
    const calculateCourierEarnings = (order) => {
        if (!order) return 0;
        const deliveryFee = (order.deliveryMethod === 'DELIVERY' || order.deliveryType === 'DELIVERY') ? 60 : 0;
        const tipAmount = order.tipAmount || 0;
        return deliveryFee + tipAmount;
    };

    // Filter deliveries based on active tab
    const filteredDeliveries = deliveries.filter(delivery => {
        if (activeTab === 'CURRENT') {
            return ['IN_PROGRESS', 'PICKED_UP', "READY"].includes(delivery.orderStatus);
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
            case 'READY':
                return (
                    <button
                        className="btn btn-orange btn-warning btn-sm w-100"
                        onClick={() => handleUpdateStatus(order.orderId, 'PICKED_UP')}
                    >
                        <FontAwesomeIcon icon={faBox} className="me-2" /> Mark as Picked Up
                    </button>
                );
            case 'PICKED_UP':
                return (
                    <button
                        className="btn btn-success btn-sm w-100"
                        onClick={() => handleUpdateStatus(order.orderId, 'DELIVERED')}
                    >
                        <FontAwesomeIcon icon={faTruck} className="me-2" /> Mark as Delivered
                    </button>
                );
            case 'DELIVERED':
                return (
                    <button className="btn btn-outline-success btn-sm w-100" disabled>
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Delivered
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
                            <h2 className="display-4 text-white">
                                My Deliveries
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

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

            <div className="container-fluid py-4 flex-grow-1" style={{ background: "#EBEDF3", minHeight: "70vh" }}>
                <div className="container">
                    {/* Status Filter Bar */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-body p-0">
                                    <div className="status-filter-bar d-flex">
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeTab === 'ALL' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveTab('ALL')}
                                        >
                                            <FontAwesomeIcon icon={faClipboardList} className="me-2 text-secondary" />
                                            <span>All</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeTab === 'CURRENT' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveTab('CURRENT')}
                                        >
                                            <FontAwesomeIcon icon={faMotorcycle} className="me-2 text-warning" />
                                            <span>Current</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeTab === 'COMPLETED' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveTab('COMPLETED')}
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
                                            <span>Completed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && <div className="alert alert-danger mb-4">{error}</div>}

                    {/* Deliveries list */}
                    {loading && !refreshing ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-warning" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading your deliveries...</p>
                        </div>
                    ) : sortedDeliveries.length > 0 ? (
                        <div className="order-list">
                            {sortedDeliveries.map(order => (
                                <div className="order-item mb-4" key={order.orderId}>
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-md-3">
                                                    <div className="order-info-column">
                                                        <h5 className="card-title">Order #{order.orderId.substring(order.orderId.length - 6)}</h5>
                                                        <p className="mb-1 small">
                                                            <FontAwesomeIcon icon={faCalendar} className="text-muted me-2" />
                                                            {formatDateTime(order.orderDate)}
                                                        </p>
                                                        <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                                                            {order.orderStatus.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <p className="mb-1 small">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-2" />
                                                        <strong>From:</strong> {order.restaurant?.name || "Restaurant"}
                                                    </p>
                                                    <p className="mb-1 small">
                                                        <FontAwesomeIcon icon={faUser} className="text-info me-2" />
                                                        <strong>To:</strong> {order.customer?.name || "Customer"}
                                                    </p>
                                                    <p className="mb-0 small">
                                                        <FontAwesomeIcon icon={faClock} className="text-secondary me-2" />
                                                        <strong>Address:</strong> {order.deliveryAddress}
                                                    </p>
                                                </div>
                                                <div className="col-md-3">
                                                    <p className="mb-1">
                                                        <strong>Total Earning:</strong>
                                                    </p>
                                                    <h5 className="text-orange">₺{calculateCourierEarnings(order).toFixed(2)}</h5>
                                                    
                                                </div>
                                                <div className="col-md-2 text-right">
                                                    {renderActionButton(order)}
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm w-100 mt-2"
                                                        onClick={() => handleExpandOrder(order.orderId)}
                                                    >
                                                        {expandedOrderId === order.orderId ? (
                                                            <>Hide Items <FontAwesomeIcon icon={faChevronUp} /></>
                                                        ) : (
                                                            <>View Items <FontAwesomeIcon icon={faChevronDown} /></>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedOrderId === order.orderId && (
                                            <div className="card-footer order-details-section p-3">
                                                <h6 className="mb-3">Order Details</h6>
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <h6>Items</h6>
                                                        <table className="table table-sm">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    <th>Item</th>
                                                                    <th>Qty</th>
                                                                    <th>Price</th>
                                                                    <th>Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items && Object.entries(order.items).map(([itemKey, quantity], index) => {
                                                                    try {
                                                                        const item = JSON.parse(itemKey);
                                                                        return (
                                                                            <tr key={index}>
                                                                                <td>{item.name}</td>
                                                                                <td>{quantity}</td>
                                                                                <td>{item.price.toFixed(2)} TL</td>
                                                                                <td>{(quantity * item.price).toFixed(2)} TL</td>
                                                                            </tr>
                                                                        );
                                                                    } catch (e) {
                                                                        console.error('Error parsing item:', e);
                                                                        return null;
                                                                    }
                                                                })}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <td colSpan="3" className="text-right"><strong>Items Total:</strong></td>
                                                                    <td>{calculateItemsTotal(order.items).toFixed(2)} TL</td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan="3" className="text-right"><strong>Customer Tip:</strong></td>
                                                                    <td>{(order.tipAmount || 0).toFixed(2)} TL</td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan="3" className="text-right"><strong>Delivery Fee:</strong></td>
                                                                    <td>{(order.deliveryMethod === 'DELIVERY' || order.deliveryType === 'DELIVERY') ? '60.00' : '0.00'} TL</td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan="3" className="text-right"><strong>My Total Earnings:</strong></td>
                                                                    <td><strong>{calculateCourierEarnings(order).toFixed(2)} TL</strong></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h6>Delivery Information</h6>
                                                        <div className="card p-3">
                                                            <ul className="list-group list-group-flush">
                                                                <li className="list-group-item">
                                                                    <strong>Restaurant:</strong><br />
                                                                    {order.restaurant?.name || 'Restaurant Name'}<br />
                                                                    <small className="text-muted">{order.restaurant?.address || 'Restaurant Address'}</small>
                                                                </li>
                                                                <li className="list-group-item">
                                                                    <strong>Customer:</strong><br />
                                                                    {order.customer?.name || 'Customer Name'}<br />
                                                                    <small className="text-muted">{order.deliveryAddress || 'Delivery Address'}</small>
                                                                </li>
                                                                <li className="list-group-item">
                                                                    <strong>Order Time:</strong><br />
                                                                    {formatDateTime(order.orderDate)}
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                            <div className="d-flex justify-content-center">
                                <button
                                    className="btn btn-orange btn-warning mt-3 mx-auto px-4"
                                    onClick={() => navigate('/')}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minWidth: '200px',
                                        margin: '0 auto'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faMotorcycle} className="me-2" />
                                    Find New Orders
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CourierDeliveriesPage;