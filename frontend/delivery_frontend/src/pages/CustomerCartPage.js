import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft, faCreditCard, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
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


        const sampleCartItems = [
            {
                id: 1,
                restaurantId: 1,
                restaurantName: "Apple Jabba",
                itemId: 101,
                name: "Margherita Pizza",
                price: 12.99,
                quantity: 2,
                specialInstructions: "Extra cheese please"
            },
            {
                id: 2,
                restaurantId: 2,
                restaurantName: "BB.Q Chicken",
                itemId: 201,
                name: "Original Fried Chicken",
                price: 15.99,
                quantity: 1,
                specialInstructions: ""
            }
        ];

        setTimeout(() => {
            setCartItems(sampleCartItems);
            setLoading(false);
        }, 500);
    }, [navigate]);


    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);


    const deliveryFee = 3.99;


    const total = subtotal + deliveryFee;


    const handleQuantityChange = (id, change) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };


    const handleRemoveItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
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
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row">
                        <div className="col-lg-8 col-md-12 mb-4">
                            <div className="bg-white p-4 rounded shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="mb-0">Shopping Cart</h4>

                                </div>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading your cart...</p>
                                    </div>
                                ) : cartItems.length > 0 ? (
                                    <div>
                                        {cartItems.map(item => (
                                            <div className="card mb-3" key={item.id}>
                                                <div className="card-body">
                                                    <div className="row align-items-center">
                                                        <div className="col-md-6">
                                                            <h5 className="card-title">{item.name}</h5>
                                                            <p className="card-text text-muted mb-1">
                                                                <small>From: {item.restaurantName}</small>
                                                            </p>
                                                            {item.specialInstructions && (
                                                                <p className="card-text mb-1">
                                                                    <small>Note: {item.specialInstructions}</small>
                                                                </p>
                                                            )}
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
                                                            <p className="font-weight-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                                            <p className="text-muted">
                                                                <small>${item.price.toFixed(2)} each</small>
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
                                        ))}
                                    </div>
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
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span>Delivery Fee</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between mb-4">
                                    <span className="font-weight-bold">Total</span>
                                    <span className="font-weight-bold">${total.toFixed(2)}</span>
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