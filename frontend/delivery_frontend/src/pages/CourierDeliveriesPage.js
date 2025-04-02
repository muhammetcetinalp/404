import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle, faMapMarkerAlt, faUser, faCheckCircle, faBox, faTruck, faFilter } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';
import '../styles/restaurant-dashboard.css';
import '../styles/order.css';
import '../styles/courier.css';

const CourierDeliveriesPage = () => {
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('latest');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState({});
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('ready_for_pickup'); // Default active tab
    const navigate = useNavigate();

    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    const orderStatusColors = {
        "confirmed": "info",
        "ready_for_pickup": "warning",
        "picked_up": "primary",
        "delivered": "success",
        "cancelled": "danger"
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Example deliveries data -  this should come from your API
        const exampleDeliveries = [
            {
                id: 1,
                restaurantName: "Apple Jabba",
                restaurantLocation: "123 Main St, City",
                customerName: "John Doe",
                customerLocation: "456 Park Ave, City",
                customerPhone: "+90 555 123 4567",
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
                customerName: "Jane Smith",
                customerLocation: "321 Oak St, City",
                customerPhone: "+90 555 987 6543",
                status: "picked_up",
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
                customerName: "Robert Johnson",
                customerLocation: "890 Pine St, City",
                customerPhone: "+90 555 789 0123",
                status: "delivered",
                orderTime: "2025-03-30T14:45:00",
                totalPrice: 175.25,
                items: [
                    { name: "T-Bone Steak", quantity: 1, price: 28.99 },
                    { name: "Beef Burger", quantity: 1, price: 16.99 }
                ]
            }
        ];

        setMyDeliveries(exampleDeliveries);
        applyFilters(exampleDeliveries, sortOption, activeTab);
        setLoading(false);

        // you need fetch data from your API:
        /*
        const fetchMyDeliveries = async () => {
            try {
                const response = await api.get('/courier/my-deliveries');
                setMyDeliveries(response.data);
                applyFilters(response.data, sortOption, activeTab);
                setLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load deliveries. Please try again later.');
                setLoading(false);
            }
        };
        fetchMyDeliveries();
        */
    }, [token, navigate]);

    const applyFilters = (deliveries, sort, status) => {
        let results = [...deliveries];

        // Filter by status
        if (status !== 'all') {
            results = results.filter(delivery => delivery.status === status);
        }

        // Sorting logic
        switch (sort) {
            case 'latest':
                results.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
                break;
            case 'oldest':
                results.sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));
                break;
            case 'status':
                // Sort by status priority (ready_for_pickup -> picked_up -> delivered)
                const statusPriority = {
                    "ready_for_pickup": 1,
                    "picked_up": 2,
                    "delivered": 3,
                    "cancelled": 4
                };
                results.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
                break;
            default:
                break;
        }

        setFilteredDeliveries(results);
    };

    useEffect(() => {
        applyFilters(myDeliveries, sortOption, activeTab);
    }, [sortOption, activeTab, myDeliveries]);

    const handleExpandOrder = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
            setLoadingOrderDetails(true);

            // Find the order in our current state to display details
            const orderDetail = myDeliveries.find(order => order.id === orderId);
            if (orderDetail) {
                setOrderDetails({ ...orderDetails, [orderId]: orderDetail });
                setLoadingOrderDetails(false);
            }

            //  you need fetch additional details:
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            // you need make an API call:
            // await api.put(`/courier/orders/${orderId}/status`, { status: newStatus });

            //  update the local state
            const updatedDeliveries = myDeliveries.map(delivery => {
                if (delivery.id === orderId) {
                    return { ...delivery, status: newStatus };
                }
                return delivery;
            });

            setMyDeliveries(updatedDeliveries);
            applyFilters(updatedDeliveries, sortOption, activeTab);

            // If the order details are expanded, update those too
            if (orderDetails[orderId]) {
                setOrderDetails({
                    ...orderDetails,
                    [orderId]: { ...orderDetails[orderId], status: newStatus }
                });
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to update order status. Please try again.');
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };

    const renderStatusButtons = (order) => {
        switch (order.status) {
            case 'ready_for_pickup':
                return (
                    <button
                        className="btn btn-primary btn-sm mb-2 w-100"
                        onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                    >
                        <FontAwesomeIcon icon={faBox} className="mr-1" />
                        Mark as Picked Up
                    </button>
                );
            case 'picked_up':
                return (
                    <button
                        className="btn btn-success btn-sm mb-2 w-100"
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    >
                        <FontAwesomeIcon icon={faTruck} className="mr-1" />
                        Mark as Delivered
                    </button>
                );
            case 'delivered':
                return (
                    <button
                        className="btn btn-secondary btn-sm mb-2 w-100" disabled
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Completed
                    </button>
                );
            default:
                return null;
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div>
            <div className="container-fluid dashboard-header">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="display-4 text-white">My Deliveries</h1>
                            <p className="lead text-white">
                                Manage your active deliveries and update their status.
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
                                            Latest First
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'oldest' ? 'active' : ''}`}
                                            onClick={() => setSortOption('oldest')}
                                        >
                                            Oldest First
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'status' ? 'active' : ''}`}
                                            onClick={() => setSortOption('status')}
                                        >
                                            By Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Orders */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 mb-4">
                                {/* Status Tabs - Similar to OrderPage.js */}
                                <div className="card-header bg-white p-0 mb-4">
                                    <div className="order-tabs-container">
                                        <div
                                            className={`order-tab ${activeTab === 'ready_for_pickup' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('ready_for_pickup')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faBox} />
                                                <span className="order-req-tab-text">Ready for Pickup</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`order-tab ${activeTab === 'picked_up' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('picked_up')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faMotorcycle} />
                                                <span className="order-req-tab-text">Picked Up</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`order-tab ${activeTab === 'delivered' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('delivered')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                <span className="order-req-tab-text">Delivered</span>
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
                                            <div className="order-item" key={order.id}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-8 ">
                                                                <h5 className="card-title location-line">
                                                                    {order.restaurantName}
                                                                    <span className={`badge bg-warning text-dark p-2 fs-6 ml-2`}>
                                                                        {order.status.replace(/_/g, ' ')
                                                                            .split(' ')
                                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                            .join(' ')}
                                                                    </span>
                                                                </h5>
                                                                <p className="card-text  mb-1">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                                                    <strong>Pickup:</strong> {order.restaurantLocation}
                                                                </p>
                                                                <p className="card-text mb-1">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                                                    <strong>Delivery:</strong> {order.customerLocation}
                                                                </p>
                                                                <p className="card-text mb-1">
                                                                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                                                                    <strong>Customer:</strong> {order.customerName} ({order.customerPhone})
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>Order Time:</strong> {formatDateTime(order.orderTime)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-4 text-right">
                                                                <h5 className="text-warning mb-3">₺{order.totalPrice.toFixed(2)}</h5>
                                                                {renderStatusButtons(order)}
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
                                        <h5>No {activeTab.replace('_', ' ')} deliveries</h5>
                                        <p>You don't have any {activeTab.replace('_', ' ')} deliveries at the moment.</p>
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