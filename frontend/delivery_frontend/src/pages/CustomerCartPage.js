import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash, faArrowLeft, faCreditCard,
    faMinusCircle, faPlusCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/dashboard.css';
import '../styles/cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
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
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/profile');

                if (response.data && response.data.profile) {
                    setAccountStatus(response.data.profile.accountStatus || 'ACTIVE');

                    // Askıya alınmış kullanıcılar için uyarı
                    if (response.data.profile.accountStatus === 'SUSPENDED') {
                        toast.warning('Your account has been suspended. You cannot place orders.');
                    } else if (response.data.profile.accountStatus === 'BANNED') {
                        // Ban edilmiş kullanıcıları giriş sayfasına yönlendir
                        toast.error('Your account has been banned. You cannot access this page.');
                        localStorage.clear();
                        setTimeout(() => {
                            navigate('/login');
                        }, 2000);
                        return;
                    }
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        };

        const fetchCart = async () => {
            try {
                const response = await api.get('/cart/showcart');
                setCartItems(response.data);
            } catch (err) {
                console.error('Error fetching cart:', err);

                if (err.response && err.response.status === 403) {
                    // Yasaklı restoranlar veya askıya alınmış müşteriler için hata
                    setError(err.response.data || 'Failed to load cart');
                } else {
                    setError('Failed to load cart');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
        fetchCart();
    }, [navigate]);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Set delivery fee to 0 if cart is empty, otherwise 60.0
    const deliveryFee = cartItems.length > 0 ? 60.0 : 0;
    const total = subtotal + deliveryFee;

    const handleQuantityChange = async (menuItemId, change) => {
        // Askıya alınmış kullanıcılar sepet içeriğini değiştiremez
        if (accountStatus === 'SUSPENDED' || accountStatus === 'BANNED') {
            toast.error(`Your account has been ${accountStatus.toLowerCase()}. You cannot modify your cart.`);
            return;
        }

        try {
            if (change === 1) {
                await api.post(`/cart/add?menuItemId=${menuItemId}&quantity=1`);
            } else {
                await api.delete(`/orders/remove?menuItemId=${menuItemId}`);
            }
            const updated = await api.get('/cart/showcart');
            setCartItems(updated.data);
        } catch (err) {
            const errorMsg = err.response?.data || 'Could not update item quantity';
            console.error('Error updating cart:', errorMsg);

            // Show warning on screen
            setWarning(errorMsg);
            toast.error(errorMsg);

            // Hide after 3 seconds
            setTimeout(() => setWarning(''), 3000);
        }
    };

    const handleRemoveItem = async (menuItemId) => {
        // Askıya alınmış kullanıcılar sepet içeriğini değiştiremez
        if (accountStatus === 'SUSPENDED' || accountStatus === 'BANNED') {
            toast.error(`Your account has been ${accountStatus.toLowerCase()}. You cannot modify your cart.`);
            return;
        }

        try {
            await api.delete(`/orders/remove-all?menuItemId=${menuItemId}`);
            const updated = await api.get('/cart/showcart');
            setCartItems(updated.data);
        } catch (err) {
            console.error('Error removing item:', err);
            const errorMsg = err.response?.data || 'Could not remove item';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleContinueShopping = () => {
        navigate('/customer-dashboard');
    };

    const handleCheckout = () => {
        // Askıya alınmış kullanıcılar ödeme sayfasına gidemez
        if (accountStatus === 'SUSPENDED' || accountStatus === 'BANNED') {
            toast.error(`Your account has been ${accountStatus.toLowerCase()}. You cannot checkout.`);
            return;
        }

        navigate('/checkout');
    };

    return (
        <div className="cart-page-wrapper d-flex flex-column min-vh-100">
            <div className="container-fluid dashboard-header">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10 col-sm-12">
                            <h2 className="text-center text-white">Your Cart</h2>
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

            <div className="container-fluid py-4" style={{ background: "#EBEDF3", minHeight: "60vh" }}>
                <div className="cart-section-wrapper">

                    <div className="container">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {warning && (
                            <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                {warning}
                            </div>
                        )}

                        {accountStatus === 'SUSPENDED' && (
                            <div className="alert alert-warning" role="alert">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                <strong>Your account has been suspended!</strong> You can view your cart but cannot place orders.
                                Please contact support for assistance.
                            </div>
                        )}

                        <div className="row">
                            <div className="col-lg-8 col-md-12 mb-4">
                                <div className="bg-white p-4 rounded shadow-sm" style={{ minHeight: "280px" }}>
                                    <h4 className="mb-4">Shopping Cart</h4>

                                    {loading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-warning" role="status" />
                                            <p className="mt-2">Loading your cart...</p>
                                        </div>
                                    ) : cartItems.length > 0 ? (
                                        cartItems.map(item => (
                                            <div className="card mb-3" key={item.id}>
                                                <div className="card-body">
                                                    <div className="row align-items-center">
                                                        <div className="col-md-6">
                                                            <div>
                                                                <strong>{item.name}</strong>
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                                                                {item.description}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <div className="quantity-control d-flex align-items-center">
                                                                <button
                                                                    className="btn btn-sm text-muted"
                                                                    onClick={() => handleQuantityChange(item.id, -1)}
                                                                    disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                                                >
                                                                    <FontAwesomeIcon icon={faMinusCircle} />
                                                                </button>
                                                                <span className="mx-2">{item.quantity}</span>
                                                                <button
                                                                    className="btn btn-sm text-muted"
                                                                    onClick={() => handleQuantityChange(item.id, 1)}
                                                                    disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlusCircle} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2 d-flex flex-column align-items-end justify-content-center">
                                                            <div className="font-weight-bold" style={{ fontSize: '1.1rem' }}>
                                                                {(item.price * item.quantity).toFixed(2)} TL
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                                {item.price.toFixed(2)} TL each
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2 text-right">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faShoppingCart} className="fa-3x text-muted mb-3" />
                                            <h5>Your cart is empty</h5>
                                            <p>Add some delicious items to your cart</p>
                                            <button
                                                className="btn-orange btn mt-3 "
                                                onClick={handleContinueShopping}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                Browse Restaurants
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-12">
                                <div className="bg-white p-4 rounded shadow-sm" style={{ minHeight: "280px" }}>
                                    <h4 className="mb-4">Order Summary</h4>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <span>{subtotal.toFixed(2)} TL</span>
                                    </div>
                                    {cartItems.length > 0 && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Delivery Fee</span>
                                            <span>{deliveryFee.toFixed(2)} TL</span>
                                        </div>
                                    )}
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="font-weight-bold">Total</span>
                                        <span className="font-weight-bold">{total.toFixed(2)} TL</span>
                                    </div>
                                    <button
                                        className="btn-orange btn btn-warning btn-block"
                                        onClick={handleCheckout}
                                        disabled={cartItems.length === 0 || accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                    >
                                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                        Proceed to Checkout
                                    </button>
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

export default Cart;