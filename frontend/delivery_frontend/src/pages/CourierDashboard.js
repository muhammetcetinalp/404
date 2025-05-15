import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMotorcycle,
    faCheckCircle,
    faTimesCircle,
    faFilter,
    faMapMarkerAlt,
    faUser,
    faClipboardCheck,
    faSort,
    faArrowDown,
    faArrowUp,
    faArrowUpShortWide,
    faArrowDownShortWide,
    faChevronDown,
    faChevronUp,
    faClock,
    faToggleOn,
    faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';
import '../styles/restaurant-dashboard.css';
import { AccountStatusBanner, checkAccountStatus } from '../components/AccountStatusBanner';
import { jwtDecode } from 'jwt-decode';

const CourierDashboard = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('latest');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState({});
    const [processingOrders, setProcessingOrders] = useState(new Set());
    const [courierStatus, setCourierStatus] = useState('UNAVAILABLE');
    const [statusLoading, setStatusLoading] = useState(false);
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

    // Fetch courier profile to get current status
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchCourierProfile = async () => {
            try {
                const response = await api.get('/profile');
                if (response.data && response.data.status) {
                    setCourierStatus(response.data.status);
                }
            } catch (err) {
                console.error('Error fetching courier profile:', err);
            }
        };

        fetchCourierProfile();
    }, [token, navigate]);

    // Toggle courier status (AVAILABLE/UNAVAILABLE)
    const toggleCourierStatus = async () => {
        try {
            setStatusLoading(true);
            const newStatus = courierStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';

            // Call the API to update courier status
            await api.patch(`/couriers/${courierId}/status`, { status: newStatus });

            setCourierStatus(newStatus);

            // If courier is now unavailable, clear pending orders
            if (newStatus === 'UNAVAILABLE') {
                setPendingOrders([]);
            } else {
                // If courier is now available, fetch available orders
                fetchAvailableOrders();
            }

            setStatusLoading(false);
        } catch (err) {
            console.error('Error updating courier status:', err);
            setError('Failed to update status. Please try again.');
            setStatusLoading(false);
        }
    };

    // Fetch new incoming order requests that the courier can accept or reject
    // In CourierDashboard.js
    // Modify the fetchAvailableOrders function to filter out pickup orders

    const fetchAvailableOrders = async () => {
        try {
            setLoading(true);

            // Only fetch orders if courier is AVAILABLE
            if (courierStatus === 'AVAILABLE') {
                // Fetch all available orders
                const response = await api.get('/courier/orders/available');

                // Then fetch courier's assigned orders
                const assignedResponse = await api.get('/courier/orders/assigned');

                if (response.data && Array.isArray(response.data)) {
                    console.log('Available Orders:', response.data);

                    // Filter out pickup orders - only show DELIVERY orders
                    const deliveryOrdersOnly = response.data.filter(
                        order => order.deliveryMethod === 'DELIVERY' ||
                            order.deliveryType === 'DELIVERY'
                    );

                    // If there are assigned orders
                    if (assignedResponse.data && Array.isArray(assignedResponse.data)) {
                        console.log('Assigned Orders:', assignedResponse.data);

                        // Add assigned order IDs to a set
                        const assignedOrderIds = new Set(
                            assignedResponse.data.map(order => order.orderId)
                        );

                        // Filter out orders that are already assigned
                        const availableOrdersOnly = deliveryOrdersOnly.filter(
                            order => !assignedOrderIds.has(order.orderId)
                        );

                        setPendingOrders(availableOrdersOnly);
                    } else {
                        // If no assigned orders, show all DELIVERY available orders
                        setPendingOrders(deliveryOrdersOnly);
                    }
                } else {
                    setError('No orders available or unexpected data format');
                }
            } else {
                // If courier is UNAVAILABLE, clear pending orders
                setPendingOrders([]);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching available orders:', err);
            setError(err.response?.data || 'Failed to load orders');
            setLoading(false);
        }
    };

    // Fetch orders when component mounts or when courier status changes
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Check account status
        if (!checkAccountStatus()) {
            return; // If BANNED, the checkAccountStatus function will handle redirection
        }

        fetchAvailableOrders();
    }, [token, navigate, courierStatus]);

    // Apply sorting to orders
    useEffect(() => {
        const sortedOrders = [...pendingOrders];

        switch (sortOption) {
            case 'latest':
                sortedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                break;
            case 'oldest':
                sortedOrders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
                break;
            case 'highestPrice':
                sortedOrders.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'lowestPrice':
                sortedOrders.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
            default:
                break;
        }

        setPendingOrders(sortedOrders);
    }, [sortOption]);

    const handleExpandOrder = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);

            // Find the order in our current state to display details
            const orderDetail = pendingOrders.find(order => order.orderId === orderId);
            if (orderDetail) {
                setOrderDetails({ ...orderDetails, [orderId]: orderDetail });
            }
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            // Mark order as processing
            setProcessingOrders(prev => new Set(prev).add(orderId));

            // Remove order from UI first
            setPendingOrders(prevOrders =>
                prevOrders.filter(order => order.orderId !== orderId)
            );

            // Call API
            await api.patch(`/courier/orders/accept-available/${orderId}`);

            // Show success message
            alert('Order accepted successfully!');

            // Redirect to deliveries page
            navigate('/my-deliveries');
        } catch (err) {
            // Provide more descriptive error message
            if (err.response?.status === 400 && err.response?.data?.includes('already accepted')) {
                alert('This order has already been accepted. Check your deliveries page.');
                navigate('/my-deliveries');
            } else {
                console.error('Error accepting order:', err);
                setError('Failed to accept order. Please try again.');

                // Add the order back to the list if there was an error
                const failedOrder = pendingOrders.find(o => o.orderId === orderId);
                if (failedOrder) {
                    setPendingOrders(prev => [...prev, failedOrder]);
                }
            }
        } finally {
            // Clear processing state
            setProcessingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container-fluid dashboard-header">
                <Header />
                <AccountStatusBanner />
                <div className="container dashboard-welcome-text">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h2 className="display-4 text-white">
                                Order Requests
                            </h2>

                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-4 flex-grow-1" style={{ background: "#EBEDF3", minHeight: "70vh" }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {courierStatus === 'UNAVAILABLE' && (
                        <div className="alert alert-warning" role="alert">
                            <strong>You are currently marked as Unavailable!</strong> Change your status to Available to view and accept new orders.
                        </div>
                    )}

                    <div className="row">
                        {/* Left Sidebar - Sort Options */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar rounded shadow-sm mb-4">
                                <div className="text-center">
                                    <h5 className="mb-3">Courier Status</h5>
                                    <button
                                        className={`btn ${courierStatus === 'AVAILABLE' ? 'btn-success' : 'btn-secondary'} w-100`}
                                        onClick={toggleCourierStatus}
                                        disabled={statusLoading}
                                    >
                                        {statusLoading ? (
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={courierStatus === 'AVAILABLE' ? faToggleOn : faToggleOff}
                                                className="me-2"
                                            />
                                        )}
                                        {courierStatus === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white p-4 dashboard-sidebar rounded shadow-sm">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faSort} className="mr-2 me-1" /> Sort By
                                </h5>

                                <div className="list-group">
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'latest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('latest')}
                                        disabled={courierStatus === 'UNAVAILABLE'}
                                    >
                                        <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                            <FontAwesomeIcon icon={faArrowDownShortWide} />
                                        </span>
                                        <span className="ml-2">Latest Orders</span>
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'oldest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('oldest')}
                                        disabled={courierStatus === 'UNAVAILABLE'}
                                    >
                                        <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                            <FontAwesomeIcon icon={faArrowUpShortWide} />
                                        </span>
                                        <span className="ml-2">Oldest Orders</span>
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'highestPrice' ? 'active' : ''}`}
                                        onClick={() => setSortOption('highestPrice')}
                                        disabled={courierStatus === 'UNAVAILABLE'}
                                    >
                                        <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                            <FontAwesomeIcon icon={faArrowDown} />
                                        </span>
                                        <span className="ml-2">Highest Price</span>
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'lowestPrice' ? 'active' : ''}`}
                                        onClick={() => setSortOption('lowestPrice')}
                                        disabled={courierStatus === 'UNAVAILABLE'}
                                    >
                                        <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                            <FontAwesomeIcon icon={faArrowUp} />
                                        </span>
                                        <span className="ml-2">Lowest Price</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Orders */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="mb-4 border-bottom pb-2">Incoming Order Requests</h4>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading order requests...</p>
                                    </div>
                                ) : courierStatus === 'UNAVAILABLE' ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faToggleOff} size="3x" className="text-muted mb-3" />
                                        <h5>You are currently unavailable</h5>
                                        <p>Toggle your status to 'Available' to view and accept new orders.</p>
                                    </div>
                                ) : pendingOrders.length > 0 ? (
                                    <div className="order-list">
                                        {pendingOrders.map(order => (
                                            <div
                                                className="order-item mb-4"
                                                key={order.orderId}
                                            >
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-3">
                                                                <div className="order-info-column">
                                                                    <h5 className="card-title">Order #{order.orderId.substring(order.orderId.length - 6)}</h5>
                                                                    <p className="mb-1 small">
                                                                        <strong>Time:</strong> {formatDateTime(order.orderDate)}
                                                                    </p>
                                                                    <span className="badge bg-warning">READY</span>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <p className="mb-1 small">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger mr-2 me-1" />
                                                                    <strong>From:</strong> {order.restaurant?.address || "Restaurant Address"}
                                                                </p>
                                                                <p className="mb-1 small">
                                                                    <FontAwesomeIcon icon={faUser} className="text-info mr-2 me-1" />
                                                                    <strong>To:</strong> {order.deliveryAddress}
                                                                </p>
                                                                <p className="mb-0 small">
                                                                    <FontAwesomeIcon icon={faClock} className="text-secondary mr-2 me-1" />
                                                                    <strong>Est. Time:</strong> 30-45 min
                                                                </p>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <p className="mb-1">
                                                                    <strong>Total Amount:</strong>
                                                                </p>
                                                                <h5 className="text-orange">₺{order.totalAmount.toFixed(2)}</h5>
                                                            </div>
                                                            <div className="col-md-2 text-right">
                                                                <button
                                                                    className="btn btn-success btn-sm mb-2 w-100"
                                                                    onClick={() => handleAcceptOrder(order.orderId)}
                                                                    disabled={processingOrders.has(order.orderId) || courierStatus === 'UNAVAILABLE'}
                                                                >
                                                                    {processingOrders.has(order.orderId) ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                                            Processing...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                                            Accept
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm w-100"
                                                                    onClick={() => handleExpandOrder(order.orderId)}
                                                                >
                                                                    {expandedOrderId === order.orderId ? (
                                                                        <>Hide Details <FontAwesomeIcon icon={faChevronUp} /></>
                                                                    ) : (
                                                                        <>View Details <FontAwesomeIcon icon={faChevronDown} /></>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedOrderId === order.orderId && (
                                                        <div className="card-footer order-details-section p-3">
                                                            <h6 className="mb-3">Order Items</h6>
                                                            <table className="table table-sm">
                                                                <thead className="thead-light">
                                                                    <tr>
                                                                        <th>Item</th>
                                                                        <th>Quantity</th>
                                                                        <th className="text-right">Price</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {Object.entries(orderDetails[order.orderId]?.items || {}).map(([itemKey, quantity], index) => {
                                                                        try {
                                                                            const item = JSON.parse(itemKey);
                                                                            return (
                                                                                <tr key={index}>
                                                                                    <td>{item.name}</td>
                                                                                    <td>{quantity}</td>
                                                                                    <td className="text-right">₺{(item.price * quantity).toFixed(2)}</td>
                                                                                </tr>
                                                                            );
                                                                        } catch (e) {
                                                                            return null;
                                                                        }
                                                                    })}
                                                                    <tr className="table-warning">
                                                                        <td colSpan="2"><strong>Total</strong></td>
                                                                        <td className="text-right"><strong>₺{order.totalAmount.toFixed(2)}</strong></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faMotorcycle} size="3x" className="text-muted mb-3" />
                                        <h5>No new order requests</h5>
                                        <p>There are currently no new orders available for delivery.</p>
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

export default CourierDashboard;