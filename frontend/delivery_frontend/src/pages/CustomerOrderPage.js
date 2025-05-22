import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faTruck, faTasks, faChevronDown, faChevronUp,
    faCheck, faClock, faShippingFast, faExclamationTriangle,
    faUtensils, faBoxOpen, faTimes, faUserSlash, faStar
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RatingModal from '../components/RatingModal';
import api from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/order.css';
import { confirmAlert } from 'react-confirm-alert';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrders, setExpandedOrders] = useState({});
    const [activeStatus, setActiveStatus] = useState('all');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [ratedOrders, setRatedOrders] = useState(new Set());
    const [orderFeedbacks, setOrderFeedbacks] = useState({});
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchPastOrders();
        fetchRatedOrders();
    }, [navigate]);

    const fetchPastOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders/history');
            // Sort orders by date in descending order (newest first)
            const sortedOrders = res.data.sort((a, b) => {
                return new Date(b.orderDate) - new Date(a.orderDate);
            });
            setOrders(sortedOrders);

            // if (res.data && res.data.length > 0) {
            //     const uniqueStatuses = [...new Set(res.data.map(order => order.orderStatus))];
            //     console.log("All order statuses in system:", uniqueStatuses);
            // }
        } catch (err) {
            console.error('Error fetching past orders:', err);
            setError('Failed to load past orders.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRatedOrders = async () => {
        try {
            const response = await api.get('/feedback/rated-orders');
            setRatedOrders(new Set(response.data));
        } catch (err) {
            console.error('Error fetching rated orders:', err);
        }
    };

    const toggleOrder = async (orderId) => {
        setExpandedOrders(prev => {
            const newState = { ...prev, [orderId]: !prev[orderId] };

            // If expanding and order is rated, fetch feedback
            if (newState[orderId] && ratedOrders.has(orderId) && !orderFeedbacks[orderId]) {
                fetchOrderFeedback(orderId);
            }

            return newState;
        });
    };

    const fetchOrderFeedback = async (orderId) => {
        try {
            const response = await api.get(`/feedback/restaurant/order/${orderId}`);
            setOrderFeedbacks(prev => ({
                ...prev,
                [orderId]: response.data
            }));
        } catch (err) {
            console.error('Error fetching order feedback:', err);
        }
    };

    const handleCancelOrder = async (orderId, event) => {
        event.stopPropagation();

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="custom-ui">
                        <div className="custom-ui-icon">
                            <FontAwesomeIcon icon={faTimes} />
                        </div>
                        <div className="me-2">
                            <h2>Cancel Order</h2>
                            <p2 className="d-block mb-4">Are you sure you want to cancel this order?</p2>
                        </div>
                        <div className="custom-ui-buttons">
                            <button
                                className="btn-cancel"
                                onClick={onClose}
                            >
                                No
                            </button>
                            <button
                                className="btn-delete"
                                onClick={async () => {
                                    try {
                                        await api.delete(`/orders/${orderId}/cancel`);
                                        toast.success('Order cancelled successfully!');
                                        fetchPastOrders();
                                        onClose();
                                    } catch (err) {
                                        const errorMessage = err.response?.data?.message || 'Failed to cancel order. The order might have already been processed.';
                                        toast.error(errorMessage);
                                        onClose();
                                    }
                                }}
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                );
            }
        });
    };

    const handleRateOrder = (order) => {
        setSelectedOrder(order);
        setShowRatingModal(true);
    };

    const handleEditRating = (order) => {
        const existingFeedback = orderFeedbacks[order.orderId];
        setSelectedOrder({
            ...order,
            existingRating: existingFeedback.rating,
            existingReview: existingFeedback.review
        });
        setShowRatingModal(true);
    };

    const handleRatingSubmit = async ({ rating, review }) => {
        try {
            if (selectedOrder.existingRating !== undefined) {
                // This is an update
                await api.put(`/feedback/restaurant-rating/${selectedOrder.orderId}`, {
                    rating,
                    review
                });
                toast.success('Your feedback has been updated!', {
                    style: {
                        backgroundColor: '#eb6825',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                });
            } else {
                // This is a new rating
                await api.post(`/feedback/restaurant-rating/${selectedOrder.orderId}`, {
                    rating,
                    review
                });
                toast.success('Thank you for your feedback!', {
                    style: {
                        backgroundColor: '#eb6825',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                });
            }

            setShowRatingModal(false);
            setSelectedOrder(null);

            // Refresh the data
            await fetchPastOrders();
            await fetchRatedOrders();

            // If the order was expanded, fetch its feedback
            if (expandedOrders[selectedOrder.orderId]) {
                await fetchOrderFeedback(selectedOrder.orderId);
            }
        } catch (err) {
            console.error('Error submitting rating:', err);
            toast.error('Failed to submit rating. Please try again.');
        }
    };

    const handleCancelOrder = async (orderId, event) => {
        event.stopPropagation();

        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await api.delete(`/orders/${orderId}/cancel`);
                toast.success('Order cancelled successfully!');
                fetchPastOrders();
            } catch (err) {
                console.error('Error cancelling order:', err);
                const errorMessage = err.response?.data?.message || 'Failed to cancel order. The order might have already been processed.';
                toast.error(errorMessage);
            }
        }
    };


    const getStatusBadge = (status) => {
        const lowerStatus = status ? status.toLowerCase().replace(/_/g, '') : ''; // Alt çizgileri kaldır

        if (lowerStatus.includes('deliver')) {
            return <span className="badge bg-success">DELIVERED</span>;
        } else if (lowerStatus === 'pending') {
            return <span className="badge bg-warning">PENDING</span>;
        } else if (lowerStatus.includes('progress')) {
            return <span className="badge bg-info">IN PROGRESS</span>;
        } else if (lowerStatus.includes('prepar')) {
            return <span className="badge bg-info" style={{ backgroundColor: '#17a2b8' }}>PREPARING</span>;
        } else if (lowerStatus === 'ready') {
            return <span className="badge bg-primary">READY</span>;
        } else if (lowerStatus.includes('pick')) {
            return <span className="badge" style={{ backgroundColor: '#6f42c1', color: 'white' }}>PICKED UP</span>;
        } else if (lowerStatus === 'cancelledbycustomer') { // <<--- YENİ DURUM İÇİN KONTROL
            return <span className="badge bg-danger">CANCELLED BY YOU</span>;
        } else if (lowerStatus.includes('cancel')) { // Genel 'cancelled' durumu
            return <span className="badge bg-danger">CANCELLED</span>;
        } else {
            return <span className="badge bg-secondary">{status || 'UNKNOWN'}</span>;
        }
    };

    const filteredOrders = activeStatus === 'all'
        ? orders
        : orders.filter(order => {
            const status = order.orderStatus?.toLowerCase().replace(/_/g, '') || '';
            if (activeStatus === 'delivered') return status.includes('deliver');
            if (activeStatus === 'pending') return status.includes('pending');
            if (activeStatus === 'inProgress') return status.includes('progress');
            if (activeStatus === 'preparing') return status.includes('prepar');
            if (activeStatus === 'ready') return status === 'ready';
            if (activeStatus === 'pickedUp') return status.includes('pick');
            if (activeStatus === 'cancelledByCustomer') return status === 'cancelledbycustomer'; // <<--- YENİ FİLTRE
            if (activeStatus === 'cancelled') return status.includes('cancel') && status !== 'cancelledbycustomer'; // Sadece diğer iptaller (opsiyonel)
            return true; // 'all' durumu zaten yukarıda ele alındı
        });

    const getStatusCount = (statusType) => {
        return orders.filter(order => {
            const status = order.orderStatus?.toLowerCase().replace(/_/g, '') || '';
            if (statusType === 'delivered') return status.includes('deliver');
            if (statusType === 'pending') return status.includes('pending');
            if (statusType === 'inProgress') return status.includes('progress');
            if (statusType === 'preparing') return status.includes('prepar');
            if (statusType === 'ready') return status === 'ready';
            if (statusType === 'pickedUp') return status.includes('pick');
            if (statusType === 'cancelledByCustomer') return status === 'cancelledbycustomer'; // <<--- YENİ SAYIM
            if (statusType === 'cancelled') return status.includes('cancel') && status !== 'cancelledbycustomer'; // Opsiyonel
            return false;
        }).length;
    };

    const getTimelineIconAndText = (orderStatus, targetStatus, icon, text, activeColor = 'green', inactiveColor = 'grey') => {
        const currentStatusNormalized = orderStatus?.toUpperCase().replace(/_/g, '');
        const targetStatusNormalized = targetStatus.toUpperCase().replace(/_/g, '');
        let isActive = false;
        let iconColor = inactiveColor;

        const statusOrder = [
            "PENDING",
            "INPROGRESS", // IN_PROGRESS
            "PREPARING",
            "READY",
            "PICKEDUP", // PICKED_UP
            "DELIVERED"
        ];

        const cancelledByCustomer = currentStatusNormalized === "CANCELLEDBYCUSTOMER";
        const cancelledGeneric = currentStatusNormalized === "CANCELLED";

        if (cancelledByCustomer || cancelledGeneric) {
            if (targetStatusNormalized === "PENDING" || targetStatusNormalized === currentStatusNormalized) {
                isActive = true; // Sipariş verildiyse ve iptal edildiyse, "Order Placed" aktif kalır.
            }
            if (targetStatusNormalized === "CANCELLEDBYCUSTOMER" && cancelledByCustomer) {
                icon = faUserSlash; text = "Cancelled by You"; iconColor = "darkred"; isActive = true;
            } else if (targetStatusNormalized === "CANCELLED" && cancelledGeneric) {
                icon = faExclamationTriangle; text = "Cancelled"; iconColor = "red"; isActive = true;
            }
        } else {
            const currentIndex = statusOrder.indexOf(currentStatusNormalized);
            const targetIndex = statusOrder.indexOf(targetStatusNormalized);
            if (currentIndex >= targetIndex && targetIndex !== -1) {
                isActive = true;
            }
        }

        if (isActive && !(cancelledByCustomer || cancelledGeneric)) iconColor = activeColor;
        if (isActive && (targetStatusNormalized === "CANCELLEDBYCUSTOMER" || targetStatusNormalized === "CANCELLED")) {
            // Bu renkler zaten yukarıda ayarlandı.
        }


        return (
            <div className={`timeline-item ${isActive ? 'active' : ''}`}>
                <div className="timeline-icon" style={{ color: iconColor }}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                <div className="timeline-text">{text}</div>
            </div>
        );
    };


    return (
        <div className="page-container d-flex flex-column min-vh-100">
            <div className="container-fluid myorder-header">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-10 col-sm-12">
                            <h2 className="text-center text-white mb-4">Past Orders</h2>
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

            <div className="container-fluid py-5" style={{ background: "#EBEDF3", minHeight: "70vh" }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-body p-0">
                                    <div className="status-filter-bar d-flex flex-wrap">
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'all' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('all')}
                                        >
                                            <FontAwesomeIcon icon={faTasks} className="me-1 me-md-2" />
                                            <span className="d-none d-sm-inline">All Orders</span>
                                            <span className="d-inline d-sm-none">All</span>
                                            <span className="badge bg-secondary ms-1 ms-md-2">{orders.length}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'pending' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('pending')}
                                        >
                                            <FontAwesomeIcon icon={faClock} className="me-1 me-md-2 text-warning" />
                                            <span className="d-none d-sm-inline">Pending</span>
                                            <span className="badge bg-warning ms-1 ms-md-2">{getStatusCount('pending')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'inProgress' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('inProgress')}
                                        >
                                            <FontAwesomeIcon icon={faShippingFast} className="me-1 me-md-2 text-info" />
                                            <span className="d-none d-sm-inline">In Progress</span>
                                            <span className="badge bg-info ms-1 ms-md-2">{getStatusCount('inProgress')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'preparing' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('preparing')}
                                        >
                                            <FontAwesomeIcon icon={faUtensils} className="me-1 me-md-2 text-info" />
                                            <span className="d-none d-sm-inline">Preparing</span>
                                            <span className="badge bg-info ms-1 ms-md-2" style={{ backgroundColor: '#17a2b8' }}>{getStatusCount('preparing')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'ready' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('ready')}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="me-1 me-md-2 text-primary" />
                                            <span className="d-none d-sm-inline">Ready</span>
                                            <span className="badge bg-primary ms-1 ms-md-2">{getStatusCount('ready')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'pickedUp' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('pickedUp')}
                                        >
                                            <FontAwesomeIcon icon={faBoxOpen} className="me-1 me-md-2" style={{ color: '#6f42c1' }} />
                                            <span className="d-none d-sm-inline">Picked Up</span>
                                            <span className="badge ms-1 ms-md-2" style={{ backgroundColor: '#6f42c1', color: 'white' }}>{getStatusCount('pickedUp')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'delivered' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('delivered')}
                                        >
                                            <FontAwesomeIcon icon={faTruck} className="me-1 me-md-2 text-success" />
                                            <span className="d-none d-sm-inline">Delivered</span>
                                            <span className="badge bg-success ms-1 ms-md-2">{getStatusCount('delivered')}</span>
                                        </div>
                                        {/* Opsiyonel: "Cancelled By You" için filtre butonu */}
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'cancelledByCustomer' ? 'active bg-light border-bottom border-danger' : ''}`}
                                            onClick={() => setActiveStatus('cancelledByCustomer')}
                                        >
                                            <FontAwesomeIcon icon={faUserSlash} className="me-1 me-md-2 text-danger" />
                                            <span className="d-none d-sm-inline">My Cancellations</span>
                                            <span className="badge bg-danger ms-1 ms-md-2">{getStatusCount('cancelledByCustomer')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">
                                        {activeStatus === 'all' ? 'Order History' :
                                            activeStatus === 'delivered' ? 'Delivered Orders' :
                                                activeStatus === 'pending' ? 'Pending Orders' :
                                                    activeStatus === 'preparing' ? 'Preparing Orders' :
                                                        activeStatus === 'ready' ? 'Ready Orders' :
                                                            activeStatus === 'pickedUp' ? 'Picked Up Orders' :
                                                                activeStatus === 'cancelledByCustomer' ? 'My Cancelled Orders' : // <<--- YENİ BAŞLIK
                                                                    'In Progress Orders'}
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-warning" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading past orders...</p>
                                        </div>
                                    ) : filteredOrders.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p>No {activeStatus !== 'all' ?
                                                (activeStatus === 'cancelledByCustomer' ? 'orders cancelled by you' : `${activeStatus} orders`)
                                                : ''} found.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Date</th>
                                                        <th>Items</th>
                                                        <th>Total</th>
                                                        <th>Status</th>
                                                        <th></th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrders.map(order => (
                                                        <React.Fragment key={order.orderId}>
                                                            <tr className="align-middle">
                                                                <td onClick={() => toggleOrder(order.orderId)} className="cursor-pointer">{order.orderId}</td>
                                                                <td onClick={() => toggleOrder(order.orderId)} className="cursor-pointer">{new Date(order.orderDate).toLocaleDateString()}</td>
                                                                <td onClick={() => toggleOrder(order.orderId)} className="cursor-pointer">
                                                                    {order.items && typeof order.items === 'object' ? Object.keys(order.items).length : (order.items ? order.items.length : 0)} items
                                                                </td>
                                                                <td onClick={() => toggleOrder(order.orderId)} className="cursor-pointer">{order.totalAmount.toFixed(2)} TL</td>
                                                                <td onClick={() => toggleOrder(order.orderId)} className="cursor-pointer">
                                                                    {getStatusBadge(order.orderStatus)}
                                                                </td>
                                                                <td onClick={() => toggleOrder(order.orderId)} className="cursor-pointer text-center">
                                                                    <FontAwesomeIcon icon={expandedOrders[order.orderId] ? faChevronUp : faChevronDown} className="text-secondary" />
                                                                </td>
                                                                <td className="text-center">
                                                                    {(order.orderStatus?.toUpperCase() === 'PENDING' || order.orderStatus?.toUpperCase() === 'IN_PROGRESS') && (
                                                                        <button
                                                                            className="btn btn-danger btn-sm"
                                                                            onClick={(e) => handleCancelOrder(order.orderId, e)}
                                                                            title="Cancel Order"
                                                                        >
                                                                            <FontAwesomeIcon icon={faTimes} /> Cancel
                                                                        </button>
                                                                    )}
                                                                    {order.orderStatus?.toUpperCase() === 'DELIVERED' && !ratedOrders.has(order.orderId) && (
                                                                        <button
                                                                            className="btn btn-warning btn-sm"
                                                                            onClick={() => handleRateOrder(order)}
                                                                            title="Rate Order"
                                                                        >
                                                                            <FontAwesomeIcon icon={faStar} /> Rate Order
                                                                        </button>
                                                                    )}
                                                                    {order.orderStatus?.toUpperCase() === 'DELIVERED' && ratedOrders.has(order.orderId) && (
                                                                        <button
                                                                            className="btn btn-success btn-sm"
                                                                            disabled
                                                                            title="Order Rated"
                                                                        >
                                                                            <FontAwesomeIcon icon={faStar} /> Rated
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {expandedOrders[order.orderId] && (
                                                                <tr className="bg-light">
                                                                    <td colSpan="7" className="p-4">
                                                                        <div className="order-details">
                                                                            {/* Order Details Card */}
                                                                            <div className="card mb-4">
                                                                                <div className="card-header bg-white">
                                                                                    <h6 className="mb-0">Order Details</h6>
                                                                                </div>
                                                                                <div className="card-body">
                                                                                    <div className="mb-3">
                                                                                        <strong>Delivery Address:</strong> {order.deliveryAddress}
                                                                                    </div>

                                                                                    <div className="mb-3">
                                                                                        <strong>Order Items:</strong>
                                                                                    </div>
                                                                                    {order.items && typeof order.items === 'object' ?
                                                                                        Object.entries(order.items).map(([key, item]) => (
                                                                                            <div className="row mb-2" key={item.name + key}>
                                                                                                <div className="col-md-6"><strong>{item.name}</strong></div>
                                                                                                <div className="col-md-2">x{item.quantity}</div>
                                                                                                <div className="col-md-2">{item.price.toFixed(2)} TL</div>
                                                                                                <div className="col-md-2 text-end">{(item.price * item.quantity).toFixed(2)} TL</div>
                                                                                            </div>
                                                                                        )) :
                                                                                        (order.items && Array.isArray(order.items) && order.items.map((item, index) => (
                                                                                            <div className="row mb-2" key={item.name + index}>
                                                                                                <div className="col-md-6"><strong>{item.name}</strong></div>
                                                                                                <div className="col-md-2">x{item.quantity}</div>
                                                                                                <div className="col-md-2">{item.price.toFixed(2)} TL</div>
                                                                                                <div className="col-md-2 text-end">{(item.price * item.quantity).toFixed(2)} TL</div>
                                                                                            </div>
                                                                                        )))
                                                                                    }

                                                                                    <div className="mt-3 pt-2 border-top">
                                                                                        <div className="row">
                                                                                            <div className="col-md-8 text-end">
                                                                                                <strong>Total:</strong>
                                                                                            </div>
                                                                                            <div className="col-md-4 text-end">
                                                                                                <strong>{order.totalAmount.toFixed(2)} TL</strong>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Order Status Card */}
                                                                            <div className="card mb-4">
                                                                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                                                                    <h6 className="mb-0">Order Status</h6>
                                                                                    {getStatusBadge(order.orderStatus)}
                                                                                </div>
                                                                                <div className="card-body">
                                                                                    <div className="order-timeline">
                                                                                        <div className="d-flex justify-content-between flex-wrap">
                                                                                            {getTimelineIconAndText(order.orderStatus, "PENDING", faClock, "Order Placed")}

                                                                                            {order.orderStatus?.toUpperCase().replace(/_/g, '') !== "CANCELLEDBYCUSTOMER" &&
                                                                                                order.orderStatus?.toUpperCase().replace(/_/g, '') !== "CANCELLED" && (
                                                                                                    <>
                                                                                                        {getTimelineIconAndText(order.orderStatus, "IN_PROGRESS", faShippingFast, "In Progress")}
                                                                                                        {getTimelineIconAndText(order.orderStatus, "PREPARING", faUtensils, "Preparing")}
                                                                                                        {getTimelineIconAndText(order.orderStatus, "READY", faCheck, "Ready")}
                                                                                                        {getTimelineIconAndText(order.orderStatus, "PICKED_UP", faBoxOpen, "Picked Up", '#6f42c1')}
                                                                                                        {getTimelineIconAndText(order.orderStatus, "DELIVERED", faTruck, "Delivered")}
                                                                                                    </>
                                                                                                )}

                                                                                            {order.orderStatus?.toUpperCase().replace(/_/g, '') === "CANCELLEDBYCUSTOMER" &&
                                                                                                getTimelineIconAndText(order.orderStatus, "CANCELLED_BY_CUSTOMER", faUserSlash, "Cancelled by You", "darkred")
                                                                                            }
                                                                                            {order.orderStatus?.toUpperCase().replace(/_/g, '') === "CANCELLED" &&
                                                                                                getTimelineIconAndText(order.orderStatus, "CANCELLED", faExclamationTriangle, "Cancelled", "red")
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Feedback Card */}
                                                                            {ratedOrders.has(order.orderId) && orderFeedbacks[order.orderId] && (
                                                                                <div className="card">
                                                                                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                                                                        <h6 className="mb-0">Your Feedback</h6>
                                                                                        <div className="d-flex justify-content-end align-items-center">
                                                                                            <button
                                                                                                className="btn-orange btn btn-outline-warning btn-sm"
                                                                                                onClick={() => handleEditRating(order)}
                                                                                            >
                                                                                                <FontAwesomeIcon icon={faStar} /> Edit Rating
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="card-body">
                                                                                        <div className="mb-3">
                                                                                            <strong>Rating: </strong>
                                                                                            {[...Array(5)].map((_, index) => (
                                                                                                <FontAwesomeIcon
                                                                                                    key={index}
                                                                                                    icon={faStar}
                                                                                                    className={index < orderFeedbacks[order.orderId].rating ? 'text-warning' : 'text-secondary'}
                                                                                                />
                                                                                            ))}
                                                                                        </div>
                                                                                        <div className="mb-3">
                                                                                            <strong>Review: </strong>
                                                                                            <p className="mt-2 mb-0">
                                                                                                {orderFeedbacks[order.orderId].review || 'No written review'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="text-muted small">
                                                                                            Submitted on: {new Date(orderFeedbacks[order.orderId].createdAt).toLocaleDateString()}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RatingModal
                show={showRatingModal}
                onClose={() => {
                    setShowRatingModal(false);
                    setSelectedOrder(null);
                }}
                onSubmit={handleRatingSubmit}
                restaurantName={selectedOrder?.restaurant?.name || ''}
                existingRating={selectedOrder?.existingRating}
                existingReview={selectedOrder?.existingReview}
            />

            <Footer />
        </div>
    );
};

export default OrderPage;
