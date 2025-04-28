import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle, faCheckCircle, faTimesCircle, faFilter, faStar } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import CourierIntegration from './CourierIntegration';
import '../styles/dashboard.css';
import '../styles/restaurant-dashboard.css';
import { AccountStatusBanner, checkAccountStatus } from '../components/AccountStatusBanner';
import { jwtDecode } from 'jwt-decode';

const CourierDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('latest');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState({});
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const navigate = useNavigate();

    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    // Get courier ID from JWT token
    let courierId;
    try {
        const decoded = jwtDecode(token);
        courierId = decoded.id;
        console.log("Courier ID (from JWT):", courierId);
    } catch (error) {
        console.error("JWT decode error:", error);
    }

    const orderStatusColors = {
        "new": "primary",
        "confirmed": "info",
        "ready_for_pickup": "warning",
        "picked_up": "success",
        "delivered": "secondary",
        "cancelled": "danger"
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Check account status
        if (!checkAccountStatus()) {
            return; // If BANNED, the checkAccountStatus function will handle redirection
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get('/courier/orders/active');

                if (response.data && Array.isArray(response.data)) {
                    setOrders(response.data);
                    setFilteredOrders(response.data);
                } else {
                    setError('Invalid data format received from server');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load orders. Please try again later.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token, navigate]);

    useEffect(() => {
        let results = orders;

        // Sorting logic
        switch (sortOption) {
            case 'latest':
                results.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                break;
            case 'oldest':
                results.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
                break;
            case 'highestPrice':
                results.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'lowestPrice':
                results.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
            default:
                break;
        }

        setFilteredOrders(results);
    }, [sortOption, orders]);

    const handleExpandOrder = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
            setLoadingOrderDetails(true);

            // Find the order in our current state to display details
            const orderDetail = orders.find(order => order.orderId === orderId);
            if (orderDetail) {
                setOrderDetails({ ...orderDetails, [orderId]: orderDetail });
                setLoadingOrderDetails(false);
            }
        }
    };

    // Örnek: Handlera API çağrısı ekleyelim
    const handleAcceptOrder = async (orderId) => {
        try {
            await api.patch(`/courier/orders/accept/${orderId}`);

            // Update the local state
            const updatedOrders = orders.filter(order => order.orderId !== orderId);
            setOrders(updatedOrders);
            setFilteredOrders(updatedOrders);

            // Navigate to My Deliveries page after accepting
            navigate('/my-deliveries');
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to accept order. Please try again.');
        }
    };
    const handleDeclineOrder = async (orderId) => {
        try {
            // There's no direct decline endpoint, so we'll just remove it from our UI
            // In a real implementation, you would call an API to decline the order
            const updatedOrders = orders.filter(order => order.orderId !== orderId);
            setOrders(updatedOrders);
            setFilteredOrders(updatedOrders);
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to decline order. Please try again.');
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };

    return (
        <div>
            <div className="container-fluid dashboard-header">
                <Header />

                {/* Account Status Banner - For suspended users */}
                <AccountStatusBanner />

                <div className="container dashboard-welcome-text">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="display-4 text-white">Available Orders</h1>
                            <p className="lead text-white">
                                Accept orders from restaurants where you are registered.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-4" style={{ background: "#EBEDF3" }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row">
                        {/* Left Sidebar - Sort Options */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Sort By
                                </h5>

                                <div className="ml-2">
                                    <div className="list-group">
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'latest' ? 'active' : ''}`}
                                            onClick={() => setSortOption('latest')}
                                        >
                                            Latest Orders
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'oldest' ? 'active' : ''}`}
                                            onClick={() => setSortOption('oldest')}
                                        >
                                            Oldest Orders
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'highestPrice' ? 'active' : ''}`}
                                            onClick={() => setSortOption('highestPrice')}
                                        >
                                            Highest Price
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'lowestPrice' ? 'active' : ''}`}
                                            onClick={() => setSortOption('lowestPrice')}
                                        >
                                            Lowest Price
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Orders */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 mb-4">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading available orders...</p>
                                    </div>
                                ) : filteredOrders.length > 0 ? (
                                    <div className="order-list">
                                        {filteredOrders.map(order => (
                                            <div className="order-item" key={order.orderId}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-8">
                                                                <h5 className="card-title mb-3">
                                                                    {order.restaurant?.name || "Restaurant"}
                                                                </h5>
                                                                <p className="card-text mb-1">
                                                                    <strong>Restaurant Location:</strong> {order.restaurant?.address || "Restaurant Address"}
                                                                </p>
                                                                <p className="card-text mb-1">
                                                                    <strong>Customer Location:</strong> {order.deliveryAddress}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>Order Time:</strong> {formatDateTime(order.orderDate)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-4 text-right">
                                                                <h5 className="text-warning mb-3">₺{order.totalAmount.toFixed(2)}</h5>
                                                                <button
                                                                    className="btn btn-success btn-sm mb-2"
                                                                    onClick={() => handleAcceptOrder(order.orderId)}
                                                                >
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleDeclineOrder(order.orderId)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="row mt-2">
                                                            <div className="col-12">
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm"
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
                                                            {loadingOrderDetails ? (
                                                                <div className="text-center py-3">
                                                                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                                                                        <span className="sr-only">Loading details...</span>
                                                                    </div>
                                                                </div>
                                                            ) : orderDetails[order.orderId] ? (
                                                                <div>
                                                                    <table className="table table-sm">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Item</th>
                                                                                <th>Quantity</th>
                                                                                <th className="text-right">Price</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {Object.entries(orderDetails[order.orderId].items || {}).map(([itemKey, quantity], index) => {
                                                                                const item = JSON.parse(itemKey);
                                                                                return (
                                                                                    <tr key={index}>
                                                                                        <td>{item.name}</td>
                                                                                        <td>{quantity}</td>
                                                                                        <td className="text-right">₺{(item.price * quantity).toFixed(2)}</td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                            <tr className="table-active">
                                                                                <td colSpan="2"><strong>Total</strong></td>
                                                                                <td className="text-right"><strong>₺{order.totalAmount.toFixed(2)}</strong></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <p className="text-center text-muted">No details available</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faMotorcycle} size="3x" className="text-muted mb-3" />
                                        <h5>No available orders</h5>
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