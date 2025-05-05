import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUtensils, faCheckCircle, faTimesCircle, faClock, faChevronDown, faChevronUp, faStore, faToggleOn, faToggleOff, faShippingFast, faSort, faArrowDown, faArrowUp, faArrowUpShortWide, faArrowDownShortWide, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '../styles/restaurant-dashboard.css';
import '../styles/dashboard.css';

const RestaurantDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState({});
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const [restaurantOpen, setRestaurantOpen] = useState();
    const [accountStatus, setAccountStatus] = useState('ACTIVE');
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

    // Get restaurant ID from JWT token
    let restaurantId;
    try {
        const decoded = jwtDecode(token);
        restaurantId = decoded.id;
        console.log("Restaurant ID (from JWT):", restaurantId);
    } catch (error) {
        console.error("JWT decode error:", error);
        // Fall back to localStorage
        restaurantId = localStorage.getItem('restaurantId');
        console.log("Restaurant ID (from localStorage):", restaurantId);
    }

    // Headers for API requests
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Status options for filtering
    const statusOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN PROGRESS', label: 'Accepted' },
        { value: 'PREPARING', label: 'Preparing' },
        { value: 'READY', label: 'Ready for Pickup' },
        { value: 'PICKED_UP', label: 'Picked Up' },
        { value: 'DELIVERED', label: 'Delivered' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    // Fetch restaurant profile to check account status
    const fetchRestaurantProfile = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8080/api/profile',
                { headers }
            );
            console.log("Restaurant profile:", response.data);

            if (response.data && response.data.accountStatus) {
                setAccountStatus(response.data.accountStatus);
            }
        } catch (err) {
            console.error('Error fetching restaurant profile:', err);
        }
    };

    // Fetch restaurant details including open status
    const fetchRestaurantDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/restaurants/${restaurantId}`,
                { headers }
            );
            console.log("Restaurant details:", response.data);

            setRestaurantOpen(response.data.open);

        } catch (err) {
            console.error('Error fetching restaurant details:', err);
        }
    };

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log("Fetching past orders for restaurant:", restaurantId);

            const response = await axios.get(
                `http://localhost:8080/api/orders/history/restaurant/${restaurantId}`,
                { headers }
            );

            console.log("Past Orders fetched:", response.data);
            // Tip verisinin doğru gelip gelmediğini kontrol edelim
            if (response.data && response.data.length > 0) {
                console.log("First order complete data:", response.data[0]);
                console.log("First order tip data:", {
                    tip_amount: response.data[0].tip_amount,
                    tipAmount: response.data[0].tipAmount,
                    tip: response.data[0].tip
                });
            }

            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching past orders:', err);
            setError('Failed to load past orders. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchRestaurantProfile();
        fetchRestaurantDetails();
        fetchOrders();
    }, [token, navigate, restaurantId]);

    useEffect(() => {
        let results = orders;

        // Apply search filter
        if (searchTerm) {
            results = results.filter(order =>
                (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.orderId.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            results = results.filter(order => order.orderStatus === filterStatus);
        }

        // Apply sorting
        switch (sortOption) {
            case 'newest':
                results = [...results].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                break;
            case 'oldest':
                results = [...results].sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
                break;
            case 'highestAmount':
                results = [...results].sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'lowestAmount':
                results = [...results].sort((a, b) => a.totalAmount - b.totalAmount);
                break;
            default:
                break;
        }

        setFilteredOrders(results);
    }, [searchTerm, sortOption, filterStatus, orders]);

    // Check if an order belongs to this restaurant and is not in PENDING status
    // Suspended restaurants can continue to process orders they've already accepted
    const canUpdateOrderStatus = (order) => {
        // If restaurant is not suspended, they can update any order
        if (accountStatus !== 'SUSPENDED') {
            return true;
        }

        // Get uppercase status for consistent comparison
        const status = order.orderStatus.toUpperCase();

        // If restaurant is suspended, they can only update orders that are not PENDING
        // This allows them to complete orders they've already accepted
        return status !== 'PENDING';
    };

    const toggleRestaurantStatus = async () => {
        try {
            console.log("Toggling restaurant status for:", restaurantId);

            // Askıya alınmış restoran durumu değiştiremez
            if (accountStatus === 'SUSPENDED') {
                toast.error('Your restaurant is suspended. You cannot change restaurant status.');
                return;
            }

            const response = await axios.patch(
                `http://localhost:8080/api/restaurants/${restaurantId}/toggle-status`,
                {},
                { headers }
            );

            console.log("Status toggle response:", response.data);
            setRestaurantOpen(response.data.open);

        } catch (err) {
            console.error('Error toggling restaurant status:', err);
            setError('Failed to update restaurant status. Please try again.');
        }
    };

    const handleViewOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
            setLoadingOrderDetails(true);

            // In a real implementation, we would fetch detailed order information here
            // For now, we'll use the existing order data
            const orderDetail = orders.find(order => order.orderId === orderId);
            setTimeout(() => {
                setOrderDetails({
                    ...orderDetails,
                    [orderId]: orderDetail
                });
                setLoadingOrderDetails(false);
            }, 500);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            // Find the current order to check if we can update its status
            const currentOrder = orders.find(order => order.orderId === orderId);

            // Check if the restaurant can update this order
            if (!canUpdateOrderStatus(currentOrder)) {
                toast.error('Your restaurant is suspended. You cannot accept new orders.');
                return;
            }

            console.log(`Updating order ${orderId} status to ${newStatus}`);

            // Special handling for PICKUP orders that are being marked as picked up
            let statusToSet = newStatus;
            if (newStatus === 'PICKED_UP' &&
                (currentOrder.deliveryMethod === 'PICKUP' || currentOrder.deliveryType === 'PICKUP')) {
                // For pickup orders, when marked as picked up, they should go directly to DELIVERED
                statusToSet = 'DELIVERED';
                console.log(`This is a PICKUP order, setting status directly to ${statusToSet}`);
            }

            const response = await axios.patch(
                `http://localhost:8080/api/orders/status/${orderId}`,
                { status: statusToSet },
                { headers }
            );

            console.log("Order status update response:", response.data);

            // Use the status from the response or fall back to our calculated status
            const actualNewStatus = response.data?.orderStatus ||
                (statusToSet === 'ACCEPTED' ? 'IN PROGRESS' : statusToSet);

            // Update local state after successful API call
            const updatedOrders = orders.map(order =>
                order.orderId === orderId ? {
                    ...order,
                    orderStatus: actualNewStatus
                } : order
            );
            setOrders(updatedOrders);

            // Update expanded order details if needed
            if (expandedOrderId === orderId) {
                setOrderDetails({
                    ...orderDetails,
                    [orderId]: {
                        ...orderDetails[orderId],
                        orderStatus: actualNewStatus
                    }
                });
            }

            // Show appropriate success message
            if (newStatus === 'PICKED_UP' && statusToSet === 'DELIVERED') {
                toast.success(`Order has been picked up and marked as delivered`);
            } else {
                toast.success(`Order status updated to ${actualNewStatus}`);
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            const errorMessage = err.response?.data || 'Failed to update order status. Please try again.';
            toast.error(errorMessage);
        }
    };

    // Function to format date and time
    const formatDateTime = (dateTimeString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateTimeString).toLocaleDateString('en-US', options);
    };

    // Function to get status badge class
    const getStatusBadgeClass = (status) => {
        const upperStatus = status.toUpperCase();
        switch (upperStatus) {
            case 'PENDING': return 'bg-warning';
            case 'IN PROGRESS': return 'bg-primary';
            case 'ACCEPTED': return 'bg-primary';
            case 'PREPARING': return 'bg-info';
            case 'READY': return 'bg-success';
            case 'PICKED_UP': return 'bg-primary';
            case 'DELIVERED': return 'bg-success';
            case 'CANCELLED': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    // Calculate estimated delivery time
    const getEstimatedDeliveryTime = (order) => {
        const status = order.orderStatus.toUpperCase();
        if (status === 'DELIVERED') return 'Delivered';
        if (status === 'CANCELLED') return 'Cancelled';

        // Basic calculation - adjust based on your business logic
        const orderTime = new Date(order.orderDate);
        const now = new Date();
        const minutesSinceOrder = Math.floor((now - orderTime) / (1000 * 60));

        switch (status) {
            case 'PENDING':
                return '30-45 min';
            case 'IN PROGRESS':
            case 'ACCEPTED':
                return '25-35 min';
            case 'PREPARING':
                return '15-25 min';
            case 'READY':
                return '5-10 min';
            case 'PICKED_UP':
                return '5-15 min';
            default:
                return 'Unknown';
        }
    };

    // Ürünlerin toplam fiyatını hesaplayan fonksiyon ekleyelim
    const calculateItemsTotal = (items) => {
        if (!items || !Array.isArray(items) || items.length === 0) return 0;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Tip miktarını hesaplayan fonksiyon ekleyelim
    const calculateTipAmount = (order) => {
        if (!order || !order.totalAmount) return 0;
        const itemsTotal = calculateItemsTotal(order.items);
        // Eğer ürünlerin toplamı total'dan küçükse aradaki fark tiptir
        const tipAmount = order.totalAmount - itemsTotal;
        return tipAmount > 0 ? tipAmount : 0;
    };

    return (
        <div>
            <div className="container-fluid dashboard-header">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-10 col-sm-12">
                            <div className="search-container mb-4">
                                <div className="input-group" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0 py-2"
                                        placeholder="Search orders by customer name or order ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ height: '50px' }}
                                    />
                                    <button className="btn btn-orange border-0" style={{ height: '50px', width: '60px' }}>
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>
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

            <div className="container-fluid py-4" style={{ background: "#EBEDF3" }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {accountStatus === 'SUSPENDED' && (
                        <div className="alert alert-warning" role="alert">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                            <strong>Your restaurant account has been suspended!</strong> You cannot accept new orders or change restaurant status.
                            However, you can still process and complete orders you've already accepted.
                        </div>
                    )}

                    <div className="row">
                        {/* Left Sidebar */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                {/* Restaurant Status Toggle */}
                                <div className="mb-4">
                                    <h5 className="mb-3">
                                        <FontAwesomeIcon icon={faStore} className="mr-2 me-1" />
                                        Restaurant Status
                                    </h5>
                                    <div className="ml-2 d-flex align-items-center justify-content-between p-3" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                                        <div>
                                            <span className="font-weight-bold">
                                                {restaurantOpen ? 'Open' : 'Closed'}
                                            </span>
                                            <p className="mb-0 small text-muted">
                                                {restaurantOpen ? 'Accepting orders' : 'Not accepting orders'}
                                            </p>
                                        </div>
                                        <button
                                            className={`btn mr-2 ${restaurantOpen ? 'btn-status' : 'btn-secondary'}`}
                                            onClick={toggleRestaurantStatus}
                                            style={{ width: '80px' }}
                                            disabled={accountStatus === 'SUSPENDED'}
                                        >
                                            <FontAwesomeIcon
                                                icon={restaurantOpen ? faToggleOn : faToggleOff}
                                                className={restaurantOpen ? 'text-white me-1' : ''}
                                            />
                                            <span className={restaurantOpen ? 'text-white' : ''}>
                                                {restaurantOpen ? 'On' : 'Off'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faSort} className="mr-2 me-2" />
                                    Sort By
                                </h5>

                                <div className="ml-2 mb-4">
                                    <div className="list-group">
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'newest' ? 'active' : ''}`}
                                            onClick={() => setSortOption('newest')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faArrowDownShortWide} />
                                            </span>
                                            <span className="ml-2">Newest First</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'oldest' ? 'active' : ''}`}
                                            onClick={() => setSortOption('oldest')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faArrowUpShortWide} />
                                            </span>
                                            <span className="ml-2">Oldest First</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'highestAmount' ? 'active' : ''}`}
                                            onClick={() => setSortOption('highestAmount')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faArrowUp} />
                                            </span>
                                            <span className="ml-2">Price (Low to High)</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'lowestAmount' ? 'active' : ''}`}
                                            onClick={() => setSortOption('lowestAmount')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faArrowDown} />
                                            </span>
                                            <span className="ml-2">Price (High to Low)</span>
                                        </button>
                                    </div>
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2 me-1" />
                                    Filter By Status
                                </h5>

                                <div className="ml-2">
                                    <div className="list-group">
                                        {statusOptions.map(option => (
                                            <button
                                                key={option.value}
                                                className={`list-group-item list-group-item-action ${filterStatus === option.value ? 'active' : ''}`}
                                                onClick={() => setFilterStatus(option.value)}
                                            >
                                                <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                    {option.value === 'all' && <FontAwesomeIcon icon={faUtensils} />}
                                                    {option.value === 'PENDING' && <FontAwesomeIcon icon={faClock} />}
                                                    {option.value === 'IN PROGRESS' && <FontAwesomeIcon icon={faCheckCircle} />}
                                                    {option.value === 'ACCEPTED' && <FontAwesomeIcon icon={faCheckCircle} />}
                                                    {option.value === 'PREPARING' && <FontAwesomeIcon icon={faUtensils} />}
                                                    {option.value === 'READY' && <FontAwesomeIcon icon={faShippingFast} />}
                                                    {option.value === 'PICKED_UP' && <FontAwesomeIcon icon={faShippingFast} />}
                                                    {option.value === 'DELIVERED' && <FontAwesomeIcon icon={faCheckCircle} />}
                                                    {option.value === 'CANCELLED' && <FontAwesomeIcon icon={faTimesCircle} />}
                                                </span>
                                                <span className="ml-2">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Order Requests */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 mb-4">
                                <h4 className="mb-4">Order Requests</h4>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading orders...</p>
                                    </div>
                                ) : filteredOrders.length > 0 ? (
                                    <div className="order-list">
                                        {filteredOrders.map(order => (
                                            <div className="order-item mb-4" key={order.orderId}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-3">
                                                                <div className="order-info-column">
                                                                    <h5 className="card-title">Order #{order.orderId}</h5>
                                                                    <p className="mb-1 small">
                                                                        <strong>Time:</strong> {formatDateTime(order.orderDate)}
                                                                    </p>
                                                                    <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                                                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1).toLowerCase().replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <p className="mb-1 small">
                                                                    <strong>Customer:</strong> {order.customerName || 'Unknown'}
                                                                </p>
                                                                <p className="mb-1 small truncate-text">
                                                                    <strong>Delivery to:</strong> {order.deliveryAddress || 'N/A'}
                                                                </p>
                                                                <p className="mb-0 small">
                                                                    <strong>Est. Time:</strong> {getEstimatedDeliveryTime(order)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <p className="mb-1">
                                                                    <strong>Total Amount:</strong>
                                                                </p>
                                                                <h5 className="text-warning text-orange">{calculateItemsTotal(order.items).toFixed(2)} TL</h5>
                                                                <p className="mb-0 small">
                                                                    <strong>Items:</strong> {order.items ? order.items.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-2 text-right">
                                                                <button
                                                                    onClick={() => handleViewOrderDetails(order.orderId)}
                                                                    className="btn btn-outline-secondary btn-sm mb-2 w-100"
                                                                >
                                                                    {expandedOrderId === order.orderId ? (
                                                                        <>Hide Details <FontAwesomeIcon icon={faChevronUp} /></>
                                                                    ) : (
                                                                        <>View Details <FontAwesomeIcon icon={faChevronDown} /></>
                                                                    )}
                                                                </button>

                                                                {/* Make sure to normalize the status before comparison */}
                                                                {(() => {
                                                                    // Normalize the status to handle case and formatting variations
                                                                    const normalizedStatus = order.orderStatus.toUpperCase().replace(/[_\s]/g, '');

                                                                    // Status-specific buttons
                                                                    if (normalizedStatus === 'PENDING') {
                                                                        return (
                                                                            <>
                                                                                <button
                                                                                    className="btn btn-success btn-sm mb-2 w-100"
                                                                                    onClick={() => handleUpdateOrderStatus(order.orderId, 'ACCEPTED')}
                                                                                    disabled={!canUpdateOrderStatus(order)}
                                                                                >
                                                                                    Accept Order
                                                                                </button>
                                                                                <button
                                                                                    className="btn btn-danger btn-sm w-100"
                                                                                    onClick={() => handleUpdateOrderStatus(order.orderId, 'CANCELLED')}
                                                                                    disabled={!canUpdateOrderStatus(order)}
                                                                                >
                                                                                    Decline
                                                                                </button>
                                                                            </>
                                                                        );
                                                                    } else if (normalizedStatus === 'INPROGRESS' || normalizedStatus === 'ACCEPTED') {
                                                                        return (
                                                                            <button
                                                                                className="btn btn-info btn-sm w-100"
                                                                                onClick={() => handleUpdateOrderStatus(order.orderId, 'PREPARING')}
                                                                                disabled={!canUpdateOrderStatus(order)}
                                                                            >
                                                                                Start Preparing
                                                                            </button>
                                                                        );
                                                                    } else if (normalizedStatus === 'PREPARING') {
                                                                        return (
                                                                            <button
                                                                                className="btn btn-success btn-sm w-100"
                                                                                onClick={() => handleUpdateOrderStatus(order.orderId, 'READY')}
                                                                                disabled={!canUpdateOrderStatus(order)}
                                                                            >
                                                                                Ready for Pickup
                                                                            </button>
                                                                        );
                                                                    } else if (normalizedStatus === 'READY') {
                                                                        return (
                                                                            <button
                                                                                className="btn btn-primary btn-sm w-100"
                                                                                onClick={() => handleUpdateOrderStatus(order.orderId, 'PICKED_UP')}
                                                                                disabled={!canUpdateOrderStatus(order)}
                                                                            >
                                                                                Mark as Picked Up
                                                                            </button>
                                                                        );
                                                                    } else if (normalizedStatus === 'PICKEDUP' &&
                                                                        (order.deliveryMethod !== 'PICKUP' && order.deliveryType !== 'PICKUP')) {
                                                                        return (
                                                                            <button
                                                                                className="btn btn-success btn-sm w-100"
                                                                                onClick={() => handleUpdateOrderStatus(order.orderId, 'DELIVERED')}
                                                                                disabled={!canUpdateOrderStatus(order)}
                                                                            >
                                                                                Mark as Delivered
                                                                            </button>
                                                                        );
                                                                    } else if (normalizedStatus === 'DELIVERED' || normalizedStatus === 'CANCELLED') {
                                                                        return (
                                                                            <div className="text-muted small text-center">
                                                                                No actions available
                                                                            </div>
                                                                        );
                                                                    }
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Order Details Section */}
                                                    {expandedOrderId === order.orderId && (
                                                        <div className="card-footer order-details-section p-3">
                                                            <h6 className="mb-3">Order Details</h6>

                                                            {loadingOrderDetails ? (
                                                                <div className="text-center py-3">
                                                                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                                                                        <span className="sr-only">Loading details...</span>
                                                                    </div>
                                                                    <p className="mt-2 small">Loading order details...</p>
                                                                </div>
                                                            ) : (
                                                                <>
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
                                                                                    {order.items && order.items.map((item, index) => (
                                                                                        <tr key={index}>
                                                                                            <td>{item.name}</td>
                                                                                            <td>{item.quantity}</td>
                                                                                            <td>{item.price.toFixed(2)} TL</td>
                                                                                            <td>{(item.quantity * item.price).toFixed(2)} TL</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                                <tfoot>
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-right"><strong>Items Total:</strong></td>
                                                                                        <td>{calculateItemsTotal(order.items).toFixed(2)} TL</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-right"><strong>Tip Amount:</strong></td>
                                                                                        <td>{calculateTipAmount(order).toFixed(2)} TL</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-right"><strong>Tax:</strong></td>
                                                                                        <td>5.00 TL</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-right"><strong>Delivery Fee:</strong></td>
                                                                                        <td>{(order.deliveryMethod === 'DELIVERY' || order.deliveryType === 'DELIVERY') ? '60.00' : '0.00'} TL</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                                                                                        <td><strong>{(order.totalAmount + 5 + ((order.deliveryMethod === 'DELIVERY' || order.deliveryType === 'DELIVERY') ? 60 : 0)).toFixed(2)} TL</strong></td>
                                                                                    </tr>
                                                                                </tfoot>
                                                                            </table>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <h6>Order Status Timeline</h6>
                                                                            <div className="card p-3">
                                                                                <ul className="list-group list-group-flush">
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Order Placed</span>
                                                                                        <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : 'bg-success'}`}>
                                                                                            {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : 'Completed'}
                                                                                        </span>
                                                                                    </li>
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Order Accepted</span>
                                                                                        <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : (order.orderStatus.toUpperCase() === 'PENDING' ? 'bg-secondary' : 'bg-success')}`}>
                                                                                            {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : (order.orderStatus.toUpperCase() === 'PENDING' ? 'Pending' : 'Completed')}
                                                                                        </span>
                                                                                    </li>
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Preparing</span>
                                                                                        <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : (['PENDING', 'IN PROGRESS'].includes(order.orderStatus.toUpperCase()) ? 'bg-secondary' : 'bg-success')}`}>
                                                                                            {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : (['PENDING', 'IN PROGRESS'].includes(order.orderStatus.toUpperCase()) ? 'Pending' : 'Completed')}
                                                                                        </span>
                                                                                    </li>
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Ready for Pickup</span>
                                                                                        <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : (['PENDING', 'IN PROGRESS', 'PREPARING'].includes(order.orderStatus.toUpperCase()) ? 'bg-secondary' : 'bg-success')}`}>
                                                                                            {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : (['PENDING', 'IN PROGRESS', 'PREPARING'].includes(order.orderStatus.toUpperCase()) ? 'Pending' : 'Completed')}
                                                                                        </span>
                                                                                    </li>
                                                                                    {order.deliveryMethod === 'PICKUP' || order.deliveryType === 'PICKUP' ? (
                                                                                        <>
                                                                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                                <span>Picked Up</span>
                                                                                                <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : (order.orderStatus.toUpperCase() === 'DELIVERED' ? 'bg-success' : 'bg-secondary')}`}>
                                                                                                    {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : (order.orderStatus.toUpperCase() === 'DELIVERED' ? 'Completed' : 'Pending')}
                                                                                                </span>
                                                                                            </li>
                                                                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                                <span>Delivered</span>
                                                                                                <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : (order.orderStatus.toUpperCase() === 'DELIVERED' ? 'bg-success' : 'bg-secondary')}`}>
                                                                                                    {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : (order.orderStatus.toUpperCase() === 'DELIVERED' ? 'Completed' : 'Pending')}
                                                                                                </span>
                                                                                            </li>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                                <span>Picked Up</span>
                                                                                                <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : (['PENDING', 'IN PROGRESS', 'PREPARING', 'READY'].includes(order.orderStatus.toUpperCase()) ? 'bg-secondary' : 'bg-success')}`}>
                                                                                                    {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : (['PENDING', 'IN PROGRESS', 'PREPARING', 'READY'].includes(order.orderStatus.toUpperCase()) ? 'Pending' : 'Completed')}
                                                                                                </span>
                                                                                            </li>
                                                                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                                <span>Delivered</span>
                                                                                                <span className={`badge ${order.orderStatus.toUpperCase() === 'CANCELLED' ? 'bg-danger' : (order.orderStatus.toUpperCase() === 'DELIVERED' ? 'bg-success' : 'bg-secondary')}`}>
                                                                                                    {order.orderStatus.toUpperCase() === 'CANCELLED' ? 'Cancelled' : (order.orderStatus.toUpperCase() === 'DELIVERED' ? 'Completed' : 'Pending')}
                                                                                                </span>
                                                                                            </li>
                                                                                        </>
                                                                                    )}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row mt-3">
                                                                        <div className="col-12">
                                                                            <div className="card bg-light p-3">
                                                                                <h6>Customer Note</h6>
                                                                                <p className="mb-0">
                                                                                    {order.note ? order.note : 'No note provided.'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <FontAwesomeIcon icon={faUtensils} size="3x" className="mb-3 text-muted" />
                                        <h5>No orders found</h5>
                                        <p>There are no orders matching your current filters</p>
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

export default RestaurantDashboard;