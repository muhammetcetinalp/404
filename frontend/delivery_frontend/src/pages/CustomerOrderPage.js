import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTruck, faTasks, faChevronDown, faChevronUp, faCheck, faClock, faShippingFast } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
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

    const filteredOrders = activeStatus === 'all'
        ? orders
        : orders.filter(order => {
            if (activeStatus === 'delivered') return order.orderStatus.toLowerCase() === 'delivered';
            if (activeStatus === 'pending') return order.orderStatus.toLowerCase() === 'pending';
            if (activeStatus === 'inProgress') return order.orderStatus.toLowerCase() === 'in progress';
            return true;
        });

    const getStatusCount = (status) => {
        return orders.filter(order => {
            if (status === 'delivered') return order.orderStatus.toLowerCase() === 'delivered';
            if (status === 'pending') return order.orderStatus.toLowerCase() === 'pending';
            if (status === 'inProgress') return order.orderStatus.toLowerCase() === 'in progress';
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
                                            className={`status-item flex-fill text-center p-3 cursor-pointer ${activeStatus === 'delivered' ? 'active bg-light border-bottom border-warning' : ''}`}
                                            onClick={() => setActiveStatus('delivered')}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="me-2 text-success" />
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
                                                activeStatus === 'pending' ? 'Pending Orders' : 'In Progress Orders'}
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-warning" role="status">
                                                <span className="sr-only">Loading...</span>
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
                                                                    <span className={`badge ${order.orderStatus.toLowerCase() === 'delivered' ? 'bg-success' :
                                                                        order.orderStatus.toLowerCase() === 'pending' ? 'bg-warning' :
                                                                            'bg-info'
                                                                        }`}>
                                                                        {order.orderStatus}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <FontAwesomeIcon icon={expandedOrders[order.orderId] ? faChevronUp : faChevronDown} className="text-secondary" />
                                                                </td>
                                                            </tr>
                                                            {expandedOrders[order.orderId] && (
                                                                <tr className="bg-light">
                                                                    <td colSpan="6" className="p-3">
                                                                        {Object.entries(order.items).map(([key, item]) => (
                                                                            <div className="row mb-2" key={key}>
                                                                                <div className="col-md-6"><strong>{item.name}</strong></div>
                                                                                <div className="col-md-2">x{item.quantity}</div>
                                                                                <div className="col-md-2">{item.price.toFixed(2)} TL</div>
                                                                                <div className="col-md-2 text-right">{(item.price * item.quantity).toFixed(2)} TL</div>
                                                                            </div>
                                                                        ))}
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