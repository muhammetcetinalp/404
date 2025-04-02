import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUtensils, faCheckCircle, faTimesCircle, faClock, faChevronDown, faChevronUp, faStore, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
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
    const [restaurantOpen, setRestaurantOpen] = useState(true);

    const navigate = useNavigate();

    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');

    // Status options for filtering
    const statusOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'ready', label: 'Ready for Pickup' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    // Example orders
    const exampleOrders = [
        {
            id: 1,
            customerName: "John Doe",
            customerLocation: "123 Main St, New York",
            items: [
                { name: "Margherita Pizza", quantity: 1, price: 12.99 },
                { name: "Pasta Carbonara", quantity: 2, price: 13.50 }
            ],
            totalAmount: 39.99,
            status: "pending",
            orderTime: "2025-03-31T18:30:00",
            estimatedDeliveryTime: "30-45 min"
        },
        {
            id: 2,
            customerName: "Jane Smith",
            customerLocation: "456 Park Ave, New York",
            items: [
                { name: "Pepperoni Pizza", quantity: 2, price: 14.99 },
                { name: "Garlic Bread", quantity: 1, price: 4.50 }
            ],
            totalAmount: 34.48,
            status: "accepted",
            orderTime: "2025-03-31T18:15:00",
            estimatedDeliveryTime: "25-35 min"
        },
        {
            id: 3,
            customerName: "Robert Johnson",
            customerLocation: "789 Broadway, New York",
            items: [
                { name: "Pasta Carbonara", quantity: 1, price: 13.50 },
                { name: "Tiramisu", quantity: 1, price: 6.50 }
            ],
            totalAmount: 20.00,
            status: "preparing",
            orderTime: "2025-03-31T18:00:00",
            estimatedDeliveryTime: "15-25 min"
        },
        {
            id: 4,
            customerName: "Emily Davis",
            customerLocation: "321 5th Ave, New York",
            items: [
                { name: "T-Bone Steak", quantity: 1, price: 28.99 },
                { name: "Beef Burger", quantity: 1, price: 16.99 }
            ],
            totalAmount: 45.98,
            status: "ready",
            orderTime: "2025-03-31T17:45:00",
            estimatedDeliveryTime: "5-10 min"
        },
        {
            id: 5,
            customerName: "Michael Wilson",
            customerLocation: "654 Madison Ave, New York",
            items: [
                { name: "Iced Latte", quantity: 2, price: 4.50 },
                { name: "Chocolate Cake", quantity: 1, price: 5.99 }
            ],
            totalAmount: 14.99,
            status: "delivered",
            orderTime: "2025-03-31T17:30:00",
            estimatedDeliveryTime: "Delivered"
        },
        {
            id: 6,
            customerName: "Sophia Brown",
            customerLocation: "987 Lexington Ave, New York",
            items: [
                { name: "Grilled Chicken", quantity: 1, price: 15.99 }
            ],
            totalAmount: 15.99,
            status: "cancelled",
            orderTime: "2025-03-31T17:15:00",
            estimatedDeliveryTime: "Cancelled"
        }
    ];

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Set example orders (fetch from API)
        setOrders(exampleOrders);
        setFilteredOrders(exampleOrders);
        setLoading(false);

        // use API call:
        /*
        const fetchOrders = async () => {
          try {
            setLoading(true);
            const response = await api.get(`/restaurants/${restaurantId}/orders`);
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
    }, [token, navigate, restaurantId]);

    useEffect(() => {
        let results = orders;

        // Apply search filter
        if (searchTerm) {
            results = results.filter(order =>
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            results = results.filter(order => order.status === filterStatus);
        }

        // Apply sorting
        switch (sortOption) {
            case 'newest':
                results = [...results].sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
                break;
            case 'oldest':
                results = [...results].sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));
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

    const toggleRestaurantStatus = () => {
        const newStatus = !restaurantOpen;
        setRestaurantOpen(newStatus);

        // Here you would make an API call to update the restaurant status
        /*
        const updateRestaurantStatus = async () => {
          try {
            await api.patch(`/restaurants/${restaurantId}`, { isOpen: newStatus });
            // Success notification could be added here
          } catch (err) {
            console.error('Error updating restaurant status:', err);
            // Error notification could be added here
            // Revert the status change on error
            setRestaurantOpen(!newStatus);
          }
        };
        updateRestaurantStatus();
        */
    };

    const handleViewOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
            setLoadingOrderDetails(true);

            // we need fetch order details from API
            // For now, find the order in our example data and use it
            const orderDetail = orders.find(order => order.id === orderId);

            setTimeout(() => {
                setOrderDetails({
                    ...orderDetails,
                    [orderId]: orderDetail
                });
                setLoadingOrderDetails(false);
            }, 500);
        }
    };

    const handleUpdateOrderStatus = (orderId, newStatus) => {
        // we need make an API call to update the status
        // For now, update the state directly
        const updatedOrders = orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        );

        setOrders(updatedOrders);

        // Update expanded order details if needed
        if (expandedOrderId === orderId) {
            setOrderDetails({
                ...orderDetails,
                [orderId]: { ...orderDetails[orderId], status: newStatus }
            });
        }


        /*
        const updateOrderStatus = async () => {
          try {
            await api.patch(`/orders/${orderId}`, { status: newStatus });
            // Success notification could be added here
          } catch (err) {
            console.error('Error updating order status:', err);
            // Error notification could be added here
          }
        };
        updateOrderStatus();
        */
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
        switch (status) {
            case 'pending': return 'bg-warning';
            case 'accepted': return 'bg-primary';
            case 'preparing': return 'bg-info';
            case 'ready': return 'bg-success';
            case 'delivered': return 'bg-success';
            case 'cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
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
                                    <button
                                        className="btn btn-warning border-0"
                                        type="button"
                                        style={{ height: '50px', width: '60px' }}
                                    >
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>
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
                        {/* Left Sidebar */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                {/* Restaurant Status Toggle */}
                                <div className="mb-4">
                                    <h5 className="mb-3">
                                        <FontAwesomeIcon icon={faStore} className="mr-2" />
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
                                            className={`btn ${restaurantOpen ? 'btn-status' : 'btn-secondary'}`}
                                            onClick={toggleRestaurantStatus}
                                            style={{ width: '80px' }}
                                        >
                                            <FontAwesomeIcon
                                                icon={restaurantOpen ? faToggleOn : faToggleOff}
                                                className={restaurantOpen ? 'text-white' : ''}
                                            />
                                            <span className={restaurantOpen ? 'text-white' : ''}>
                                                {restaurantOpen ? 'On' : 'Off'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Sort By
                                </h5>

                                <div className="ml-2 mb-4">
                                    <div className="list-group">
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'newest' ? 'active' : ''}`}
                                            onClick={() => setSortOption('newest')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faClock} />
                                            </span>
                                            <span className="ml-2">Newest First</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'oldest' ? 'active' : ''}`}
                                            onClick={() => setSortOption('oldest')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faClock} />
                                            </span>
                                            <span className="ml-2">Oldest First</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'highestAmount' ? 'active' : ''}`}
                                            onClick={() => setSortOption('highestAmount')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faFilter} />
                                            </span>
                                            <span className="ml-2">Highest Amount</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'lowestAmount' ? 'active' : ''}`}
                                            onClick={() => setSortOption('lowestAmount')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faFilter} />
                                            </span>
                                            <span className="ml-2">Lowest Amount</span>
                                        </button>
                                    </div>
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
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
                                                    {option.value === 'pending' && <FontAwesomeIcon icon={faClock} />}
                                                    {option.value === 'accepted' && <FontAwesomeIcon icon={faCheckCircle} />}
                                                    {option.value === 'preparing' && <FontAwesomeIcon icon={faUtensils} />}
                                                    {option.value === 'ready' && <FontAwesomeIcon icon={faCheckCircle} />}
                                                    {option.value === 'delivered' && <FontAwesomeIcon icon={faCheckCircle} />}
                                                    {option.value === 'cancelled' && <FontAwesomeIcon icon={faTimesCircle} />}
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
                                            <div className="order-item mb-4" key={order.id}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-3">
                                                                <div className="order-info-column">
                                                                    <h5 className="card-title">Order #{order.id}</h5>
                                                                    <p className="mb-1 small">
                                                                        <strong>Time:</strong> {formatDateTime(order.orderTime)}
                                                                    </p>
                                                                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <p className="mb-1 small">
                                                                    <strong>Customer:</strong> {order.customerName}
                                                                </p>
                                                                <p className="mb-1 small truncate-text">
                                                                    <strong>Delivery to:</strong> {order.customerLocation}
                                                                </p>
                                                                <p className="mb-0 small">
                                                                    <strong>Est. Time:</strong> {order.estimatedDeliveryTime}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <p className="mb-1">
                                                                    <strong>Total Amount:</strong>
                                                                </p>
                                                                <h5 className="text-warning">${order.totalAmount.toFixed(2)}</h5>
                                                                <p className="mb-0 small">
                                                                    <strong>Items:</strong> {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-2 text-right">
                                                                <button
                                                                    onClick={() => handleViewOrderDetails(order.id)}
                                                                    className="btn btn-outline-secondary btn-sm mb-2 w-100"
                                                                >
                                                                    {expandedOrderId === order.id ? (
                                                                        <>Hide Details <FontAwesomeIcon icon={faChevronUp} /></>
                                                                    ) : (
                                                                        <>View Details <FontAwesomeIcon icon={faChevronDown} /></>
                                                                    )}
                                                                </button>

                                                                {order.status === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-success btn-sm mb-2 w-100"
                                                                            onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                                                                        >
                                                                            Accept Order
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-danger btn-sm w-100"
                                                                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                                                        >
                                                                            Decline
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {order.status === 'accepted' && (
                                                                    <button
                                                                        className="btn btn-info btn-sm w-100"
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                                                    >
                                                                        Start Preparing
                                                                    </button>
                                                                )}

                                                                {order.status === 'preparing' && (
                                                                    <button
                                                                        className="btn btn-success btn-sm w-100"
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                                                    >
                                                                        Ready for Pickup
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Order Details Section */}
                                                    {expandedOrderId === order.id && (
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
                                                                                    {order.items.map((item, index) => (
                                                                                        <tr key={index}>
                                                                                            <td>{item.name}</td>
                                                                                            <td>{item.quantity}</td>
                                                                                            <td>${item.price.toFixed(2)}</td>
                                                                                            <td>${(item.quantity * item.price).toFixed(2)}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                                <tfoot>
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-right"><strong>Subtotal:</strong></td>
                                                                                        <td>${order.totalAmount.toFixed(2)}</td>
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
                                                                                        <span className="badge bg-success">Completed</span>
                                                                                    </li>
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Order Accepted</span>
                                                                                        <span className={`badge ${order.status === 'pending' ? 'bg-secondary' : 'bg-success'}`}>
                                                                                            {order.status === 'pending' ? 'Pending' : 'Completed'}
                                                                                        </span>
                                                                                    </li>
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Preparing</span>
                                                                                        <span className={`badge ${(order.status === 'pending' || order.status === 'accepted') ? 'bg-secondary' : 'bg-success'}`}>
                                                                                            {(order.status === 'pending' || order.status === 'accepted') ? 'Pending' : 'Completed'}
                                                                                        </span>
                                                                                    </li>
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Ready for Pickup</span>
                                                                                        <span className={`badge ${(order.status === 'pending' || order.status === 'accepted' || order.status === 'preparing') ? 'bg-secondary' : 'bg-success'}`}>
                                                                                            {(order.status === 'pending' || order.status === 'accepted' || order.status === 'preparing') ? 'Pending' : 'Completed'}
                                                                                        </span>
                                                                                    </li>
                                                                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                                                                        <span>Delivered</span>
                                                                                        <span className={`badge ${order.status === 'delivered' ? 'bg-success' : 'bg-secondary'}`}>
                                                                                            {order.status === 'delivered' ? 'Completed' : 'Pending'}
                                                                                        </span>
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row mt-3">
                                                                        <div className="col-12">
                                                                            <div className="card bg-light p-3">
                                                                                <h6>Customer Notes</h6>
                                                                                <p className="mb-0 text-muted">
                                                                                    {order.notes || "No special instructions."}
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