import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';
import '../styles/checkout.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


const CheckoutPage = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [paymentMethod, setPaymentMethod] = useState('creditCard');
    const [tipAmount, setTipAmount] = useState(0);
    const [customTip, setCustomTip] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [loading, setLoading] = useState(true);

    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);

    // Inside CheckoutPage component
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const cartRes = await api.get('/cart/showcart');
                const profileRes = await api.get('/profile');
                setCartItems(cartRes.data);
                setAddress(profileRes.data.profile.address || '');
                calculateTotals(cartRes.data);

                const firstItem = cartRes.data[0];
                if (firstItem && firstItem.restaurantId) {
                    const resDetails = await api.get(`/restaurants/${firstItem.restaurantId}`);
                    const deliveryType = resDetails.data.deliveryType;

                    if (deliveryType === 'DELIVERY') {
                        setDeliveryMethod('delivery');
                    } else if (deliveryType === 'PICKUP') {
                        setDeliveryMethod('pickup');
                    } else {
                        // BOTH supported, let user choose
                        setDeliveryMethod('delivery');
                    }
                }
            } catch (err) {
                console.error("Checkout data fetch error", err);
                alert("Failed to load checkout data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);


    const calculateTotals = (items, method, customTipOverride = null) => {
        const sub = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const tax = Math.round(sub * 0.12);
        const shipping = method === 'pickup' ? 0 : 60;

        let tip = 0;
        if (customTipOverride !== null) {
            tip = parseInt(customTipOverride) || 0;
        } else if (customTip) {
            tip = parseInt(customTip) || 0;
        } else if (tipAmount !== null) {
            tip = parseInt(tipAmount) || 0;
        }

        tip = Math.max(tip, 0); // Negatifse sıfır yap

        setSubtotal(sub);
        setTax(tax);
        setShippingFee(shipping);
        setTotal(sub + tax + shipping + tip);
    };



    const handlePlaceOrder = async () => {
        try {
            if (paymentMethod === 'creditCard') {
                // Kart bilgilerini doğrula

                const cardNumberDigits = cardNumber.replace(/\s/g, ''); // boşlukları sil
                if (cardNumberDigits.length !== 16) {
                    toast.error("Please enter a valid 16-digit card number!");
                    return;
                }

                if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                    toast.error("Please enter a valid expiry date (MM/YY)!");
                    return;
                }

                if (cardCVV.length !== 3) {
                    toast.error("Please enter a valid 3-digit CVV!");
                    return;
                }
            }

            const tip = customTip ? parseFloat(customTip) || 0 : tipAmount || 0;

            const queryParams = new URLSearchParams({
                deliveryAddress: address,
                paymentMethod: paymentMethod === 'creditCard' ? 'CREDIT_CARD' : 'CASH',
                deliveryType: deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY',
                tipAmount: tip.toString()
            });

            const body = paymentMethod === 'creditCard' ? {
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryDate: cardExpiry,
                cvv: cardCVV
            } : {};

            await api.post(`/orders/create?${queryParams.toString()}`, body);

            toast.success('Order placed successfully!', {
                style: {
                    backgroundColor: '#eb6825',
                    color: 'white',
                    fontWeight: 'bold',
                },
            });
<<<<<<< HEAD
            setTimeout(() => {
                navigate('/customer-dashboard');
            }, 2000); // 1.5 saniye bekle
=======

            setTimeout(() => {
                navigate('/customer-dashboard');
            }, 2000);
>>>>>>> origin/main

        } catch (err) {
            const message = err.response?.data?.message || err.response?.data || err.message;
            console.error("Order error", message);
            toast.error('Order failed: ' + message);
        }
    };


<<<<<<< HEAD
=======

>>>>>>> origin/main
    return (
        <div className="checkout-page-wrapper d-flex flex-column min-vh-100">
            {/* Restore the header styling from the first version */}
            <div className="container-fluid dashboard-header">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10 col-sm-12">
                            <h2 className="text-center text-white">Checkout</h2>
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
            <div className="container-fluid py-4" style={{ background: "#EBEDF3" }}>
                <div className="container">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-warning" role="status"></div>
                            <p className="mt-3">Loading...</p>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="bg-white p-4 rounded shadow-sm mb-4">
                                    <h5>Delivery Method</h5>
                                    <div className="form-check">
                                        <input type="radio" id="pickup" name="delivery" className="form-check-input" checked={deliveryMethod === 'pickup'} onChange={() => {
                                            setDeliveryMethod('pickup');
                                            calculateTotals(cartItems, 'pickup');
                                        }} />
                                        <label htmlFor="pickup" className="form-check-label">Pickup</label>
                                    </div>
                                    <div className="form-check">
                                        <input type="radio" id="delivery" name="delivery" className="form-check-input" checked={deliveryMethod === 'delivery'} onChange={() => {
                                            setDeliveryMethod('delivery');
                                            calculateTotals(cartItems, 'delivery');
                                        }} />
                                        <label htmlFor="delivery" className="form-check-label">Delivery</label>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded shadow-sm mb-4">
                                    <h5>Payment Method</h5>
                                    <div className="d-flex payment-options mb-3">
                                        <button
                                            className={`btn ${paymentMethod === 'creditCard' ? 'btn-primary' : 'btn-outline-secondary'} mr-2`}
                                            onClick={() => setPaymentMethod('creditCard')}
                                        >
                                            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                            Credit or Debit Card
                                        </button>

                                        <button
                                            className={`btn ${paymentMethod === 'cashOnDelivery' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setPaymentMethod('cashOnDelivery')}
                                        >
                                            <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
                                            Cash on Delivery
                                        </button>
                                    </div>

                                    {paymentMethod === 'creditCard' && (
                                        <div className="card-payment-form">
                                            <div className="form-group mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                    value={cardNumber}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, '');
                                                        if (value.length > 16) {
                                                            value = value.slice(0, 16);
                                                        }

                                                        const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
                                                        setCardNumber(formatted);
                                                    }}
                                                />

                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="MM/YY"
                                                            value={cardExpiry}
                                                            onChange={e => {
                                                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                                if (value.length > 2) {
                                                                    setCardExpiry(value.slice(0, 2) + '/' + value.slice(2));
                                                                } else {
                                                                    setCardExpiry(value);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="CVV"
                                                            value={cardCVV}
                                                            onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {deliveryMethod === 'delivery' && (
                                    <div className="bg-white p-4 rounded shadow-sm mb-4">
                                        <h5>Tip for courier</h5>
                                        <div className="d-flex tip-options mb-3">
                                            {[0, 1, 3, 5].map(tip => (
                                                <button
                                                    key={tip}
                                                    className={`btn ${tipAmount === tip && customTip === '' ? 'btn-primary' : 'btn-outline-secondary'} mr-2`}
                                                    onClick={() => {
                                                        setTipAmount(tip);
                                                        setCustomTip('');
                                                        calculateTotals(cartItems, deliveryMethod, tip);
                                                    }}
                                                >
                                                    {tip} TL
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter custom amount"
                                            value={customTip}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (/^[0-9]*$/.test(value)) {
                                                    setCustomTip(value);
                                                    setTipAmount(null);
                                                    calculateTotals(cartItems, deliveryMethod, value);
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="bg-white p-4 rounded shadow-sm mb-4">
                                    <h5>Delivery Address</h5>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="bg-white p-4 rounded shadow-sm">
                                    <h4 className="mb-4">Order Summary</h4>
                                    {cartItems.map(item => (
                                        <div className="d-flex justify-content-between mb-2" key={item.id}>
                                            <span>{item.name}</span>
                                            <span>{item.quantity} x {item.price} TL</span>
                                        </div>
                                    ))}
                                    <hr />
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <span>{subtotal} TL</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Shipping</span>
                                        <span>{shippingFee} TL</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Tax</span>
                                        <span>{tax} TL</span>
                                    </div>
                                    {deliveryMethod === 'delivery' && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tip</span>
                                            <span>{(customTip ? parseFloat(customTip) || 0 : tipAmount || 0)} TL</span>
                                        </div>
                                    )}
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="font-weight-bold">Total</span>
                                        <span className="font-weight-bold">{total} TL</span>
                                    </div>
                                    <button
                                        className="btn-orange btn btn-warning btn-block"
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CheckoutPage;