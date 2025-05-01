import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faTruck, faTasks, faChevronDown, faChevronUp,
    faCheck, faClock, faShippingFast, faExclamationTriangle,
    faUtensils, faBoxOpen
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
    }, [navigate]);

    const fetchPastOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders/history');
            setOrders(res.data);

            // Debug: Log all unique statuses to console
            if (res.data && res.data.length > 0) {
                const uniqueStatuses = [...new Set(res.data.map(order => order.orderStatus))];
                console.log("All order statuses in system:", uniqueStatuses);
            }
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
        } else if (lowerStatus.includes('cancel')) {
            return <span className="badge bg-danger">CANCELLED</span>;
        } else {
            return <span className="badge bg-secondary">{status}</span>;
        }
    };

    const filteredOrders = activeStatus === 'all'
        ? orders
        : orders.filter(order => {
            const status = order.orderStatus?.toLowerCase() || '';
            if (activeStatus === 'delivered') return status.includes('deliver');
            if (activeStatus === 'pending') return status.includes('pending');
            if (activeStatus === 'inProgress') return status.includes('progress');
            if (activeStatus === 'preparing') return status.includes('prepar');
            if (activeStatus === 'ready') return status === 'ready';
            if (activeStatus === 'pickedUp') return status.includes('pick');
            return true;
        });

    const getStatusCount = (statusType) => {
        return orders.filter(order => {
            const status = order.orderStatus?.toLowerCase() || '';
            if (statusType === 'delivered') return status.includes('deliver');
            if (statusType === 'pending') return status.includes('pending');
            if (statusType === 'inProgress') return status.includes('progress');
            if (statusType === 'preparing') return status.includes('prepar');
            if (statusType === 'ready') return status === 'ready';
            if (statusType === 'pickedUp') return status.includes('pick');
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

                    {/* Status Filter Bar */}
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
                                            <span className="d-inline d-sm-none">Pending</span>
                                            <span className="badge bg-warning ms-1 ms-md-2">{getStatusCount('pending')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'inProgress' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('inProgress')}
                                        >
                                            <FontAwesomeIcon icon={faShippingFast} className="me-1 me-md-2 text-info" />
                                            <span className="d-none d-sm-inline">In Progress</span>
                                            <span className="d-inline d-sm-none">In Prog</span>
                                            <span className="badge bg-info ms-1 ms-md-2">{getStatusCount('inProgress')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'preparing' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('preparing')}
                                        >
                                            <FontAwesomeIcon icon={faUtensils} className="me-1 me-md-2 text-info" />
                                            <span className="d-none d-sm-inline">Preparing</span>
                                            <span className="d-inline d-sm-none">Prep</span>
                                            <span className="badge bg-info ms-1 ms-md-2" style={{ backgroundColor: '#17a2b8' }}>{getStatusCount('preparing')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'ready' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('ready')}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="me-1 me-md-2 text-primary" />
                                            <span className="d-none d-sm-inline">Ready</span>
                                            <span className="d-inline d-sm-none">Ready</span>
                                            <span className="badge bg-primary ms-1 ms-md-2">{getStatusCount('ready')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'pickedUp' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('pickedUp')}
                                        >
                                            <FontAwesomeIcon icon={faBoxOpen} className="me-1 me-md-2" style={{ color: '#6f42c1' }} />
                                            <span className="d-none d-sm-inline">Picked Up</span>
                                            <span className="d-inline d-sm-none">Picked</span>
                                            <span className="badge ms-1 ms-md-2" style={{ backgroundColor: '#6f42c1', color: 'white' }}>{getStatusCount('pickedUp')}</span>
                                        </div>
                                        <div
                                            className={`status-item flex-fill text-center p-2 p-md-3 cursor-pointer ${activeStatus === 'delivered' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('delivered')}
                                        >
                                            <FontAwesomeIcon icon={faTruck} className="me-1 me-md-2 text-success" />
                                            <span className="d-none d-sm-inline">Delivered</span>
                                            <span className="d-inline d-sm-none">Deliv</span>
                                            <span className="badge bg-success ms-1 ms-md-2">{getStatusCount('delivered')}</span>
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
                                                            activeStatus === 'pickedUp' ? 'Picked Up Orders' : 'In Progress Orders'}
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
                                                                                    <div className={`timeline-item ${['PENDING', 'IN_PROGRESS', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'].some(s =>
                                                                                        order.orderStatus?.toUpperCase().includes(s)
                                                                                    ) ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faClock} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Order Placed</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${['IN_PROGRESS', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'].some(s =>
                                                                                        order.orderStatus?.toUpperCase().includes(s)
                                                                                    ) ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faShippingFast} />
                                                                                        </div>
                                                                                        <div className="timeline-text">In Progress</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${['PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'].some(s =>
                                                                                        order.orderStatus?.toUpperCase().includes(s)
                                                                                    ) ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faUtensils} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Preparing</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${['READY', 'PICKED_UP', 'DELIVERED'].some(s =>
                                                                                        order.orderStatus?.toUpperCase().includes(s)
                                                                                    ) ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faCheck} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Ready</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${['PICKED_UP', 'DELIVERED'].some(s =>
                                                                                        order.orderStatus?.toUpperCase().includes(s)
                                                                                    ) ? 'active' : ''}`}>
                                                                                        <div className="timeline-icon">
                                                                                            <FontAwesomeIcon icon={faBoxOpen} />
                                                                                        </div>
                                                                                        <div className="timeline-text">Picked Up</div>
                                                                                    </div>

                                                                                    <div className={`timeline-item ${order.orderStatus?.toUpperCase().includes('DELIVERED') ? 'active' : ''}`}>
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