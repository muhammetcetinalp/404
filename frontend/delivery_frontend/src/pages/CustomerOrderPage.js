import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faTruck, faTasks, faChevronDown, faChevronUp,
    faCheck, faClock, faShippingFast, faExclamationTriangle,
    faUtensils
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/order.css';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrders, setExpandedOrders] = useState({});
    const [activeStatus, setActiveStatus] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchPastOrders();
    }, [navigate]);

    const fetchPastOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders/history');
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching past orders:', err);
            setError('Failed to load past orders.');
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (id) => {
        setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getStatusBadge = (status) => {
        const lowerStatus = status.toLowerCase();

        if (lowerStatus === 'delivered') {
            return <span className="badge bg-success">DELIVERED</span>;
        } else if (lowerStatus === 'pending') {
            return <span className="badge bg-warning">PENDING</span>;
        } else if (lowerStatus === 'in_progress' || lowerStatus === 'in progress') {
            return <span className="badge bg-info">IN PROGRESS</span>;
        } else if (lowerStatus === 'preparing') {
            return <span className="badge bg-info" style={{ backgroundColor: '#17a2b8' }}>PREPARING</span>;
        } else if (lowerStatus === 'ready') {
            return <span className="badge bg-primary">READY</span>;
        } else if (lowerStatus === 'cancelled') {
            return <span className="badge bg-danger">CANCELLED</span>;
        } else {
            return <span className="badge bg-secondary">{status}</span>;
        }
    };

    const filteredOrders = activeStatus === 'all'
        ? orders
        : orders.filter(order => {
            const status = order.orderStatus.toLowerCase();
            if (activeStatus === 'delivered') return status === 'delivered';
            if (activeStatus === 'pending') return status === 'pending';
            if (activeStatus === 'inProgress') return status === 'in_progress' || status === 'in progress';
            if (activeStatus === 'preparing') return status === 'preparing';
            if (activeStatus === 'ready') return status === 'ready';
            return true;
        });

    const getStatusCount = (statusType) => {
        return orders.filter(order => {
            const status = order.orderStatus.toLowerCase();
            if (statusType === 'delivered') return status === 'delivered';
            if (statusType === 'pending') return status === 'pending';
            if (statusType === 'inProgress') return status === 'in_progress' || status === 'in progress';
            if (statusType === 'preparing') return status === 'preparing';
            if (statusType === 'ready') return status === 'ready';
            return false;
        }).length;
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
            />

            <div className="container-fluid py-5" style={{ background: "#EBEDF3" }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Status Filter Bar */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-body p-0">
                                    <div className="status-filter-bar d-flex">
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeStatus === 'all' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('all')}
                                        >
                                            <FontAwesomeIcon icon={faTasks} className="me-2" />
                                            All Orders
                                            <span className="badge bg-secondary ms-2">{orders.length}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeStatus === 'pending' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('pending')}
                                        >
                                            <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
                                            Pending
                                            <span className="badge bg-warning ms-2">{getStatusCount('pending')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeStatus === 'inProgress' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('inProgress')}
                                        >
                                            <FontAwesomeIcon icon={faShippingFast} className="me-2 text-info" />
                                            In Progress
                                            <span className="badge bg-info ms-2">{getStatusCount('inProgress')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeStatus === 'preparing' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('preparing')}
                                        >
                                            <FontAwesomeIcon icon={faUtensils} className="me-2 text-info" />
                                            Preparing
                                            <span className="badge bg-info ms-2" style={{ backgroundColor: '#17a2b8' }}>{getStatusCount('preparing')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeStatus === 'ready' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('ready')}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="me-2 text-primary" />
                                            Ready
                                            <span className="badge bg-primary ms-2">{getStatusCount('ready')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeStatus === 'delivered' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('delivered')}
                                        >
                                            <FontAwesomeIcon icon={faTruck} className="me-2 text-success" />
                                            Delivered
                                            <span className="badge bg-success ms-2">{getStatusCount('delivered')}</span>
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
                                                        activeStatus === 'ready' ? 'Ready Orders' : 'In Progress Orders'}
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
                                            <p>No {activeStatus !== 'all' ? activeStatus : ''} orders found.</p>
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrders.map(order => (
                                                        <React.Fragment key={order.orderId}>
                                                            <tr className="cursor-pointer align-middle" onClick={() => toggleOrder(order.orderId)}>
                                                                <td>{order.orderId}</td>
                                                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                                                <td>{Object.keys(order.items).length} items</td>
                                                                <td>{order.totalAmount.toFixed(2)} TL</td>
                                                                <td>
                                                                    {getStatusBadge(order.orderStatus)}
                                                                </td>
                                                                <td>
                                                                    <FontAwesomeIcon icon={expandedOrders[order.orderId] ? faChevronUp : faChevronDown} className="text-secondary" />
                                                                </td>
                                                            </tr>
                                                            {expandedOrders[order.orderId] && (
                                                                <tr className="bg-light">
                                                                    <td colSpan="6" className="p-3">
                                                                        <div className="order-details">
                                                                            <div className="mb-3">
                                                                                <strong>Delivery Address:</strong> {order.deliveryAddress}
                                                                            </div>

                                                                            <div className="mb-3">
                                                                                <strong>Order Items:</strong>
                                                                            </div>

                                                                            {Object.entries(order.items).map(([key, item]) => (
                                                                                <div className="row mb-2" key={key}>
                                                                                    <div className="col-md-6"><strong>{item.name}</strong></div>
                                                                                    <div className="col-md-2">x{item.quantity}</div>
                                                                                    <div className="col-md-2">{item.price.toFixed(2)} TL</div>
                                                                                    <div className="col-md-2 text-end">{(item.price * item.quantity).toFixed(2)} TL</div>
                                                                                </div>
                                                                            ))}

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

                                                                            <div className="mt-3 order-timeline">
                                                                                <div className="d-flex justify-content-between">
                                                                                    <div className={`timeline-item ${order.orderStatus === 'PENDING' || order.orderStatus === 'IN_PROGRESS' || order.orderStatus === 'PREPARING' || order.orderStatus === 'READY' || order.orderStatus === 'DELIVERED' ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faClock} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Order Placed</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${order.orderStatus === 'IN_PROGRESS' || order.orderStatus === 'PREPARING' || order.orderStatus === 'READY' || order.orderStatus === 'DELIVERED' ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faShippingFast} />
                                                                                        </div>
                                                                                        <div className="timeline-text">In Progress</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${order.orderStatus === 'PREPARING' || order.orderStatus === 'READY' || order.orderStatus === 'DELIVERED' ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faUtensils} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Preparing</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${order.orderStatus === 'READY' || order.orderStatus === 'DELIVERED' ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faCheck} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Ready</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${order.orderStatus === 'DELIVERED' ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faTruck} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Delivered</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
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
            <Footer />
        </div>
    );
};

export default OrderPage;
