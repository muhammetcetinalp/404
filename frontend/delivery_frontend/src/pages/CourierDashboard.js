import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle, faCheckCircle, faTimesCircle, faFilter, faStar } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';
import '../styles/restaurant-dashboard.css';
import { AccountStatusBanner, checkAccountStatus } from '../components/AccountStatusBanner';

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

        // Kullanıcı durumunu kontrol et
        if (!checkAccountStatus()) {
            return; // Eğer BANNED ise, checkAccountStatus fonksiyonu yönlendirme yapacaktır
        }

        // Example orders data - in a real app, this would come from your API
        const exampleOrders = [
            {
                id: 1,
                restaurantName: "Apple Jabba",
                restaurantLocation: "123 Main St, City",
                customerLocation: "456 Park Ave, City",
                status: "ready_for_pickup",
                orderTime: "2025-03-31T15:30:00",
                totalPrice: 195.50,
                items: [
                    { name: "Margherita Pizza", quantity: 2, price: 25.99 },
                    { name: "Pasta Carbonara", quantity: 1, price: 13.50 }
                ]
            },
            {
                id: 2,
                restaurantName: "BB.Q Chicken",
                restaurantLocation: "789 Broadway, City",
                customerLocation: "321 Oak St, City",
                status: "confirmed",
                orderTime: "2025-03-31T16:00:00",
                totalPrice: 210.75,
                items: [
                    { name: "Original Fried Chicken", quantity: 1, price: 15.99 },
                    { name: "Spicy Chicken Wings", quantity: 2, price: 12.99 }
                ]
            },
            {
                id: 3,
                restaurantName: "Beef Rosati",
                restaurantLocation: "567 5th Ave, City",
                customerLocation: "890 Pine St, City",
                status: "confirmed",
                orderTime: "2025-03-31T14:45:00",
                totalPrice: 175.25,
                items: [
                    { name: "T-Bone Steak", quantity: 1, price: 28.99 },
                    { name: "Beef Burger", quantity: 1, price: 16.99 }
                ]
            }
        ];

        setOrders(exampleOrders);
        setFilteredOrders(exampleOrders);
        setLoading(false);

        // In a real application, you would fetch data from your API:
        /*
        const fetchOrders = async () => {
            try {
                const response = await api.get('/courier/available-orders');
                setOrders(response.data);
                setFilteredOrders(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load orders. Please try again later.');
                setLoading(false);
            }
        };
        fetchOrders();
        */
    }, [token, navigate]);

    useEffect(() => {
        let results = orders;

        // Sorting logic
        switch (sortOption) {
            case 'latest':
                results.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
                break;
            case 'oldest':
                results.sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));
                break;
            case 'highestPrice':
                results.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case 'lowestPrice':
                results.sort((a, b) => a.totalPrice - b.totalPrice);
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
            const orderDetail = orders.find(order => order.id === orderId);
            if (orderDetail) {
                setOrderDetails({ ...orderDetails, [orderId]: orderDetail });
                setLoadingOrderDetails(false);
            }

            // In a real app, you might fetch additional details:
            /*
            const fetchOrderDetails = async () => {
                try {
                    const response = await api.get(`/orders/${orderId}`);
                    setOrderDetails({ ...orderDetails, [orderId]: response.data });
                    setLoadingOrderDetails(false);
                } catch (err) {
                    console.error('Error:', err);
                    setLoadingOrderDetails(false);
                }
            };
            fetchOrderDetails();
            */
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            // In a real application, you would make an API call:
            // await api.post(`/courier/orders/${orderId}/accept`);

            // For demo purposes, we'll update the local state
            const updatedOrders = orders.filter(order => order.id !== orderId);
            setOrders(updatedOrders);
            setFilteredOrders(updatedOrders);

            // Navigate to My Orders page after accepting
            navigate('/my-deliveries');
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to accept order. Please try again.');
        }
    };

    const handleDeclineOrder = async (orderId) => {
        try {
            // In a real application, you would make an API call:
            // await api.post(`/courier/orders/${orderId}/decline`);

            // For demo purposes, we'll update the local state
            const updatedOrders = orders.filter(order => order.id !== orderId);
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

                {/* Account Status Banner - Suspended kullanıcılar için uyarı */}
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

            <div className="container-fluid py-4">
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
                                            <div className="order-item" key={order.id}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-8">
                                                                <h5 className="card-title mb-3">  {/* mb-3 = margin-bottom ekler */}
                                                                    {order.restaurantName}
                                                                </h5>
                                                                <p className="card-text mb-1">
                                                                    <strong>Restaurant Location:</strong> {order.restaurantLocation}
                                                                </p>
                                                                <p className="card-text mb-1">
                                                                    <strong>Customer Location:</strong> {order.customerLocation}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>Order Time:</strong> {formatDateTime(order.orderTime)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-4 text-right">
                                                                <h5 className="text-warning mb-3">₺{order.totalPrice.toFixed(2)}</h5>
                                                                <button
                                                                    className="btn btn-success btn-sm mb-2"
                                                                    onClick={() => handleAcceptOrder(order.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleDeclineOrder(order.id)}
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
                                                                    onClick={() => handleExpandOrder(order.id)}
                                                                >
                                                                    {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedOrderId === order.id && (
                                                        <div className="card-footer order-details-section">
                                                            <h6 className="mb-3">Order Items</h6>
                                                            {loadingOrderDetails ? (
                                                                <div className="text-center py-3">
                                                                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                                                                        <span className="sr-only">Loading details...</span>
                                                                    </div>
                                                                </div>
                                                            ) : orderDetails[order.id] ? (
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
                                                                            {orderDetails[order.id].items.map((item, index) => (
                                                                                <tr key={index}>
                                                                                    <td>{item.name}</td>
                                                                                    <td>{item.quantity}</td>
                                                                                    <td className="text-right">₺{(item.price * item.quantity).toFixed(2)}</td>
                                                                                </tr>
                                                                            ))}
                                                                            <tr className="table-active">
                                                                                <td colSpan="2"><strong>Total</strong></td>
                                                                                <td className="text-right"><strong>₺{order.totalPrice.toFixed(2)}</strong></td>
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