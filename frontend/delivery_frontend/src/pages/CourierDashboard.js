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
    faArrowDownShortWide
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

    // Fetch new incoming order requests that the courier can accept or reject
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Check account status
        if (!checkAccountStatus()) {
            return; // If BANNED, the checkAccountStatus function will handle redirection
        }

        const fetchAvailableOrders = async () => {
            try {
                setLoading(true);

                // Önce tüm mevcut siparişleri getir
                const response = await api.get('/courier/orders/available');

                // Sonra kuryenin kendisine atanmış siparişleri getir
                const assignedResponse = await api.get('/courier/orders/assigned');

                if (response.data && Array.isArray(response.data)) {
                    console.log('Available Orders:', response.data);

                    // Eğer atanmış siparişler de varsa
                    if (assignedResponse.data && Array.isArray(assignedResponse.data)) {
                        console.log('Assigned Orders:', assignedResponse.data);

                        // Atanmış siparişlerin ID'lerini bir sete ekle
                        const assignedOrderIds = new Set(
                            assignedResponse.data.map(order => order.orderId)
                        );

                        // Mevcut siparişlerden, atanmış olanları filtrele
                        const availableOrdersOnly = response.data.filter(
                            order => !assignedOrderIds.has(order.orderId)
                        );

                        setPendingOrders(availableOrdersOnly);
                    } else {
                        // Atanmış sipariş yoksa, tüm mevcut siparişleri göster
                        setPendingOrders(response.data);
                    }
                } else {
                    setError('No orders available or unexpected data format');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching available orders:', err);
                setError(err.response?.data || 'Failed to load orders');
                setLoading(false);
            }
        };

        fetchAvailableOrders();
    }, [token, navigate]);

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
            // Siparişin işlenmekte olduğunu belirt
            setProcessingOrders(prev => new Set(prev).add(orderId));

            // Önce siparişi UI'dan kaldır
            setPendingOrders(prevOrders =>
                prevOrders.filter(order => order.orderId !== orderId)
            );

            // API çağrısını yap
            await api.patch(`/courier/orders/accept-available/${orderId}`);

            // Başarılı mesajı göster
            alert('Sipariş başarıyla kabul edildi!');

            // Teslimatlar sayfasına yönlendir
            navigate('/my-deliveries');
        } catch (err) {
            // Hata mesajını daha açıklayıcı hale getir
            if (err.response?.status === 400 && err.response?.data?.includes('already accepted')) {
                alert('Bu sipariş zaten kabul edilmiş. Teslimatlar sayfanızı kontrol edin.');
                navigate('/my-deliveries');
            } else {
                console.error('Sipariş kabul edilirken hata:', err);
                setError('Sipariş kabul edilemedi. Lütfen tekrar deneyin.');

                // Hata durumunda siparişi listeye geri ekle
                const failedOrder = pendingOrders.find(o => o.orderId === orderId);
                if (failedOrder) {
                    setPendingOrders(prev => [...prev, failedOrder]);
                }
            }
        } finally {
            // İşlem durumunu temizle
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

                    <div className="row">
                        {/* Left Sidebar - Sort Options */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar rounded shadow-sm" style={{ height: "300px" }}>
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faSort} className="mr-2 me-1" /> Sort By
                                </h5>

                                <div className="list-group">
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'latest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('latest')}
                                    >
                                        <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                            <FontAwesomeIcon icon={faArrowDownShortWide} />
                                        </span>
                                        <span className="ml-2">Latest Orders</span>
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'oldest' ? 'active' : ''}`}
                                        onClick={() => setSortOption('oldest')}
                                    >
                                        <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                            <FontAwesomeIcon icon={faArrowUpShortWide} />
                                        </span>
                                        <span className="ml-2">Oldest Orders</span>
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'highestPrice' ? 'active' : ''}`}
                                        onClick={() => setSortOption('highestPrice')}
                                    >
                                        <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                            <FontAwesomeIcon icon={faArrowDown} />
                                        </span>
                                        <span className="ml-2">Highest Price</span>
                                    </button>
                                    <button
                                        className={`list-group-item list-group-item-action ${sortOption === 'lowestPrice' ? 'active' : ''}`}
                                        onClick={() => setSortOption('lowestPrice')}
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
                            <div className="bg-white p-4 rounded shadow-sm" style={{ height: "300px" }}>
                                <h4 className="mb-4 border-bottom pb-2">Incoming Order Requests</h4>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading order requests...</p>
                                    </div>
                                ) : pendingOrders.length > 0 ? (
                                    <div className="order-list">
                                        {pendingOrders.map(order => (
                                            <div className="card mb-3 border-left border-warning"
                                                style={{ borderLeftWidth: '5px' }}
                                                key={order.orderId}
                                            >
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-8">
                                                            <h5 className="card-title font-weight-bold text-warning mb-2">
                                                                Order #{order.orderId.substring(order.orderId.length - 6)}
                                                            </h5>
                                                            <p className="card-text mb-1">
                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger mr-2" />
                                                                <strong>From:</strong> {order.restaurant?.address || "Restaurant Address"}
                                                            </p>
                                                            <p className="card-text mb-1">
                                                                <FontAwesomeIcon icon={faUser} className="text-info mr-2" />
                                                                <strong>To:</strong> {order.deliveryAddress}
                                                            </p>
                                                            <p className="card-text text-muted">
                                                                <small>Ordered: {formatDateTime(order.orderDate)}</small>
                                                            </p>
                                                        </div>
                                                        <div className="col-md-4 text-right">
                                                            <h4 className="text-warning mb-3">₺{order.totalAmount.toFixed(2)}</h4>
                                                            <div className="btn-group d-flex flex-column">
                                                                <button
                                                                    className="btn btn-success mb-2"
                                                                    onClick={() => handleAcceptOrder(order.orderId)}
                                                                    disabled={processingOrders.has(order.orderId)}
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary mt-2"
                                                        onClick={() => handleExpandOrder(order.orderId)}
                                                    >
                                                        {expandedOrderId === order.orderId ? 'Hide Details' : 'View Order Details'}
                                                    </button>
                                                </div>

                                                {expandedOrderId === order.orderId && (
                                                    <div className="card-footer bg-light">
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