import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTruck, faTasks, faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/order.css';

import restaurantImage1 from '../assets/images/exampleRestaurants/image1.png';
import restaurantImage2 from '../assets/images/exampleRestaurants/image2.png';
import restaurantImage3 from '../assets/images/exampleRestaurants/image3.png';


const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [userDetails, setUserDetails] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [expandedOrders, setExpandedOrders] = useState({});
    const navigate = useNavigate();

    // Tab styling states
    const [tabStyles, setTabStyles] = useState({
        pending: "col-12 col-lg-4 col-md-4 text-center order-req-tab-active",
        inProgress: "col-12 col-lg-4 col-md-4 text-center",
        delivered: "col-12 col-lg-4 col-md-4 text-center"
    });

    // Fetch user data from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const name = localStorage.getItem('name');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        const profileImage = localStorage.getItem('profileImage') || '../assets/images/default-profile.png';

        if (!token) {
            navigate('/login');
            return;
        }

        setUserRole(role);
        setUserDetails({
            userName: name,
            userEmail: email,
            userProfileImageUrl: profileImage
        });

        fetchOrders();
    }, [navigate]);

    // Fetch orders from API
    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Example API call - customize based on your backend implementation
            // const response = await api.get('/orders');
            // setOrders(response.data);

            // Using mock data for now
            setTimeout(() => {
                setOrders(generateMockOrders());
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again later.');
            setLoading(false);
        }
    };

    // Generate mock order data
    const generateMockOrders = () => {
        return [
            {
                id: "ord123",
                userName: "John Doe",
                restaurantName: "Pizza Palace",
                restaurantImageUrl: restaurantImage1,
                userUid: "user123",
                status: "PENDING",
                orderDate: "2025-03-30",
                totalPrice: 28.99,
                deliveryAddress: "123 Main St, Anytown",
                itemsList: {
                    item1: {
                        itemId: "item1",
                        itemTitle: "Margherita Pizza",
                        itemPrice: 15.99,
                        itemQuantity: 1,
                        itemIngredients: "Tomato, Mozzarella, Basil",
                        itemImageUrl: "https://via.placeholder.com/70"
                    },
                    item2: {
                        itemId: "item2",
                        itemTitle: "Garlic Bread",
                        itemPrice: 5.99,
                        itemQuantity: 1,
                        itemIngredients: "Bread, Garlic, Butter, Herbs",
                        itemImageUrl: "https://via.placeholder.com/70"
                    },
                    item3: {
                        itemId: "item3",
                        itemTitle: "Cola",
                        itemPrice: 2.99,
                        itemQuantity: 1,
                        itemIngredients: "Soda",
                        itemImageUrl: "https://via.placeholder.com/70"
                    }
                }
            },
            {
                id: "ord124",
                userName: "Jane Smith",
                restaurantName: "Burger Joint",
                restaurantImageUrl: restaurantImage2,
                userUid: "user124",
                status: "IN PROGRESS",
                orderDate: "2025-03-31",
                totalPrice: 32.50,
                deliveryAddress: "456 Oak Ave, Somewhere",
                itemsList: {
                    item1: {
                        itemId: "item4",
                        itemTitle: "Cheeseburger",
                        itemPrice: 12.99,
                        itemQuantity: 1,
                        itemIngredients: "Beef patty, Cheese, Lettuce, Tomato",
                        itemImageUrl: "https://via.placeholder.com/70"
                    },
                    item2: {
                        itemId: "item5",
                        itemTitle: "French Fries",
                        itemPrice: 4.99,
                        itemQuantity: 2,
                        itemIngredients: "Potatoes, Salt",
                        itemImageUrl: "https://via.placeholder.com/70"
                    },
                    item3: {
                        itemId: "item6",
                        itemTitle: "Chocolate Milkshake",
                        itemPrice: 4.99,
                        itemQuantity: 1,
                        itemIngredients: "Milk, Chocolate, Cream",
                        itemImageUrl: "https://via.placeholder.com/70"
                    }
                }
            },
            {
                id: "ord125",
                userName: "Robert Johnson",
                restaurantName: "Sushi Express",
                restaurantImageUrl: restaurantImage3,
                userUid: "user125",
                status: "DELIVERED",
                orderDate: "2025-03-29",
                totalPrice: 45.75,
                deliveryAddress: "789 Pine St, Elsewhere",
                itemsList: {
                    item1: {
                        itemId: "item7",
                        itemTitle: "California Roll",
                        itemPrice: 14.99,
                        itemQuantity: 2,
                        itemIngredients: "Crab, Avocado, Cucumber, Rice",
                        itemImageUrl: "https://via.placeholder.com/70"
                    },
                    item2: {
                        itemId: "item8",
                        itemTitle: "Miso Soup",
                        itemPrice: 3.99,
                        itemQuantity: 1,
                        itemIngredients: "Dashi, Miso paste, Tofu, Seaweed",
                        itemImageUrl: "https://via.placeholder.com/70"
                    },
                    item3: {
                        itemId: "item9",
                        itemTitle: "Green Tea",
                        itemPrice: 2.99,
                        itemQuantity: 1,
                        itemIngredients: "Tea leaves",
                        itemImageUrl: "https://via.placeholder.com/70"
                    }
                }
            }
        ];
    };

    // Toggle order expansion
    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Handle tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);

        // Update tab styles
        if (tab === 'pending') {
            setTabStyles({
                pending: "col-12 col-lg-4 col-md-4 text-center order-req-tab-active",
                inProgress: "col-12 col-lg-4 col-md-4 text-center",
                delivered: "col-12 col-lg-4 col-md-4 text-center"
            });
        } else if (tab === 'inProgress') {
            setTabStyles({
                pending: "col-12 col-lg-4 col-md-4 text-center",
                inProgress: "col-12 col-lg-4 col-md-4 text-center order-req-tab-active",
                delivered: "col-12 col-lg-4 col-md-4 text-center"
            });
        } else if (tab === 'delivered') {
            setTabStyles({
                pending: "col-12 col-lg-4 col-md-4 text-center",
                inProgress: "col-12 col-lg-4 col-md-4 text-center",
                delivered: "col-12 col-lg-4 col-md-4 text-center order-req-tab-active"
            });
        }
    };

    // Handle order actions based on user role
    const handleOrderAction = (orderId, action) => {
        // Implementation would depend on your backend API
        console.log(`Order ${orderId} - Action: ${action}`);

        // Example implementation
        const updatedOrders = orders.map(order => {
            if (order.id === orderId) {
                if (action === 'accept' && order.status === 'PENDING') {
                    return { ...order, status: 'IN PROGRESS' };
                } else if (action === 'complete' && order.status === 'IN PROGRESS') {
                    return { ...order, status: 'DELIVERED' };
                } else if (action === 'cancel') {
                    return { ...order, status: 'CANCELLED' };
                }
            }
            return order;
        });

        setOrders(updatedOrders);
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-danger';
            case 'IN PROGRESS': return 'text-warning';
            case 'DELIVERED': return 'text-success';
            default: return 'text-secondary';
        }
    };

    // Count items in order
    const countItems = (itemsList) => {
        return Object.keys(itemsList).length;
    };

    // Render orders based on status
    const renderOrders = (status) => {
        const filteredOrders = orders.filter(order =>
            (status === 'pending' && order.status === 'PENDING') ||
            (status === 'inProgress' && order.status === 'IN PROGRESS') ||
            (status === 'delivered' && order.status === 'DELIVERED')
        );

        if (filteredOrders.length === 0) {
            return (
                <div className="text-center py-4">
                    <p>No {status.replace(/([A-Z])/g, ' $1').toLowerCase()} orders available</p>
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>{userRole === 'restaurant' ? 'Customer' : 'Restaurant'}</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <React.Fragment key={order.id}>
                                <tr className="cursor-pointer align-middle" onClick={() => toggleOrderExpansion(order.id)} style={{ height: '80px' }}>
                                    <td>{order.id}</td>
                                    <td>
                                        {userRole === 'restaurant' ? (
                                            order.userName
                                        ) : (
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={order.restaurantImageUrl}
                                                    alt={order.restaurantName}
                                                    className="rounded-circle mr-2"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                                />
                                                {order.restaurantName}
                                            </div>
                                        )}
                                    </td>
                                    <td>{order.orderDate}</td>
                                    <td>{countItems(order.itemsList)} items</td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td className={getStatusColor(order.status)}>{order.status}</td>
                                    <td>
                                        <FontAwesomeIcon
                                            icon={expandedOrders[order.id] ? faChevronUp : faChevronDown}
                                            className="text-secondary"
                                        />
                                    </td>
                                </tr>
                                {expandedOrders[order.id] && (
                                    <tr className="bg-light">
                                        <td colSpan="7" className="p-0">
                                            <div className="p-3">
                                                {userRole === 'restaurant' || userRole === 'courier' ? (
                                                    <div className="mb-3">
                                                        <strong>Delivery Address:</strong> {order.deliveryAddress}
                                                    </div>
                                                ) : null}

                                                <div className="row border-bottom pb-2 mb-2">
                                                    <div className="col-md-2 font-weight-bold">Item</div>
                                                    <div className="col-md-4 font-weight-bold">Details</div>
                                                    <div className="col-md-2 font-weight-bold text-center">Quantity</div>
                                                    <div className="col-md-2 font-weight-bold text-center">Price</div>
                                                    <div className="col-md-2 font-weight-bold text-right">Subtotal</div>
                                                </div>

                                                {Object.keys(order.itemsList).map(itemKey => {
                                                    const item = order.itemsList[itemKey];
                                                    return (
                                                        <div className="row border-bottom py-2" key={itemKey}>
                                                            <div className="col-md-2">
                                                                <img
                                                                    src={item.itemImageUrl}
                                                                    alt={item.itemTitle}
                                                                    className="img-fluid rounded"
                                                                    style={{ maxWidth: "50px" }}
                                                                />
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="font-weight-bold">{item.itemTitle}</div>
                                                                <small className="text-muted">{item.itemIngredients}</small>
                                                            </div>
                                                            <div className="col-md-2 text-center">
                                                                {item.itemQuantity}
                                                            </div>
                                                            <div className="col-md-2 text-center">
                                                                ${item.itemPrice.toFixed(2)}
                                                            </div>
                                                            <div className="col-md-2 text-right">
                                                                ${(item.itemPrice * item.itemQuantity).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                <div className="row mt-3">
                                                    <div className="col-md-8">
                                                        {order.status === 'PENDING' && userRole === 'restaurant' && (
                                                            <div>
                                                                <button className="btn btn-success btn-sm mr-2" onClick={(e) => { e.stopPropagation(); handleOrderAction(order.id, 'accept') }}>
                                                                    Accept Order
                                                                </button>
                                                                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleOrderAction(order.id, 'cancel') }}>
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                        {order.status === 'PENDING' && userRole === 'courier' && (
                                                            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleOrderAction(order.id, 'pickup') }}>
                                                                Pick Up
                                                            </button>
                                                        )}
                                                        {order.status === 'IN PROGRESS' && userRole === 'restaurant' && (
                                                            <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleOrderAction(order.id, 'complete') }}>
                                                                Mark as Ready
                                                            </button>
                                                        )}
                                                        {order.status === 'IN PROGRESS' && userRole === 'courier' && (
                                                            <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleOrderAction(order.id, 'complete') }}>
                                                                Mark as Delivered
                                                            </button>
                                                        )}
                                                        {order.status === 'DELIVERED' && userRole === 'customer' && (
                                                            !order.isRated ? (
                                                                <button
                                                                    className="btn btn-warning btn-sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Add your rating logic here
                                                                        console.log(`Rating order ${order.id}`);
                                                                        // After rating, you would update the order's isRated status
                                                                    }}
                                                                >
                                                                    Rate this order
                                                                </button>
                                                            ) : (
                                                                <span className="badge badge-success">Rated</span>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="col-md-4 text-right">
                                                        <div className="font-weight-bold">
                                                            Total: ${order.totalPrice.toFixed(2)}
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
        );
    };

    return (
        <div className="page-container d-flex flex-column min-vh-100 ">
            <div className="container-fluid myorder-header">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-10 col-sm-12">
                            <h2 className="text-center text-white mb-4">My Orders</h2>
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

                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <div className="order-tabs-container">
                                        <div
                                            className={`order-tab ${activeTab === 'pending' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('pending')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faSpinner} />
                                                <span className="order-req-tab-text">Pending</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`order-tab ${activeTab === 'inProgress' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('inProgress')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faTruck} />
                                                <span className="order-req-tab-text">In Progress</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`order-tab ${activeTab === 'delivered' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('delivered')}
                                        >
                                            <div className="order-tab-content">
                                                <FontAwesomeIcon icon={faTasks} />
                                                <span className="order-req-tab-text">Delivered</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-warning" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading orders...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {activeTab === 'pending' && renderOrders('pending')}
                                            {activeTab === 'inProgress' && renderOrders('inProgress')}
                                            {activeTab === 'delivered' && renderOrders('delivered')}
                                        </>
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