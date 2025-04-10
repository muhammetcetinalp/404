import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash, faArrowLeft, faCreditCard,
    faMinusCircle, faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';
import '../styles/cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchCart = async () => {
            try {
                const response = await api.get('/cart/showcart');
                setCartItems(response.data);
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError('Failed to load cart');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [navigate]);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 3.99;
    const total = subtotal + deliveryFee;

    const handleQuantityChange = async (menuItemId, change) => {
        try {
            if (change === 1) {
                await api.post(`/cart/add?menuItemId=${menuItemId}&quantity=1`);
            } else {
                await api.delete(`/orders/remove?menuItemId=${menuItemId}`);
            }
            const updated = await api.get('/cart/showcart');
            setCartItems(updated.data);
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError('Could not update item quantity');
        }
    };

    const handleRemoveItem = async (menuItemId) => {
        try {
            await api.delete(`/orders/remove-all?menuItemId=${menuItemId}`);
            const updated = await api.get('/cart/showcart');
            setCartItems(updated.data);
        } catch (err) {
            console.error('Error removing item:', err);
            setError('Could not remove item');
        }
    };

    const handleContinueShopping = () => {
        navigate('/dashboard');
    };

    const handleCheckout = () => {
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

            <div className="container-fluid py-4" style={{ background: "#EBEDF3" }}>
                <div className="container">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="row">
                        <div className="col-lg-8 col-md-12 mb-4">
                            <div className="bg-white p-4 rounded shadow-sm">
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
                                                        <h5 className="card-title">{item.name}</h5>
                                                        <p className="card-text text-muted mb-1">
                                                            <small>{item.description}</small>
                                                        </p>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="quantity-control d-flex align-items-center">
                                                            <button
                                                                className="btn btn-sm text-muted"
                                                                onClick={() => handleQuantityChange(item.id, -1)}
                                                            >
                                                                <FontAwesomeIcon icon={faMinusCircle} />
                                                            </button>
                                                            <span className="mx-2">{item.quantity}</span>
                                                            <button
                                                                className="btn btn-sm text-muted"
                                                                onClick={() => handleQuantityChange(item.id, 1)}
                                                            >
                                                                <FontAwesomeIcon icon={faPlusCircle} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2 text-right">
                                                        <p className="font-weight-bold">{(item.price * item.quantity).toFixed(2)} TL</p>
                                                        <p className="text-muted">
                                                            <small>{item.price.toFixed(2)} TL each</small>
                                                        </p>
                                                    </div>
                                                    <div className="col-md-2 text-right">
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleRemoveItem(item.id)}
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
                                        <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                                        <h5>Your cart is empty</h5>
                                        <p>Add some delicious items to your cart</p>
                                        <button
                                            className="btn btn-warning mt-3"
                                            onClick={handleContinueShopping}
                                        >
                                            Browse Restaurants
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-12">
                            <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="mb-4">Order Summary</h4>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toFixed(2)} TL</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee.toFixed(2)} TL</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="font-weight-bold">Total</span>
                                    <span className="font-weight-bold">{total.toFixed(2)} TL</span>
                                </div>
                                <button
                                    className="btn btn-warning btn-block"
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0}
                                >
                                    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                    Proceed to Checkout
                                </button>
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