import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCreditCard, faMoneyBill, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/dashboard.css';
import '../styles/checkout.css';

const CheckoutPage = () => {
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState('savedAddress');
    const [paymentMethod, setPaymentMethod] = useState('creditCard');
    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [tipAmount, setTipAmount] = useState(null); // Changed from 1 to null
    const [customTip, setCustomTip] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCVV] = useState('');
    const navigate = useNavigate();

    // Order summary values
    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(3.99);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Mock data - in a real app, these would come from your cart state or API
        const sampleOrderItems = [
            {
                id: 1,
                name: "Fish Burger",
                quantity: 1,
                price: 149,
            },
            {
                id: 2,
                name: "Chocolate",
                quantity: 2,
                price: 40,
            },
            {
                id: 3,
                name: "Milk",
                quantity: 3,
                price: 30,
            }
        ];

        setTimeout(() => {
            setOrderItems(sampleOrderItems);
            calculateOrderSummary(sampleOrderItems);
            setLoading(false);
        }, 500);
    }, [navigate]);

    const calculateOrderSummary = (items) => {
        const itemSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setSubtotal(itemSubtotal);

        const taxAmount = Math.round(itemSubtotal * 0.12);
        setTax(taxAmount);

        // Calculate tip amount (use customTip if provided, otherwise use selected tipAmount)
        const tipValue = customTip ? parseFloat(customTip) || 0 : tipAmount || 0;

        setTotal(itemSubtotal + shippingFee + taxAmount + tipValue);
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    const handleDeliveryMethodChange = (method) => {
        setDeliveryMethod(method);

        // Update shipping fee based on delivery method
        if (method === 'pickup') {
            setShippingFee(0);
        } else {
            setShippingFee(60);
        }

        // Recalculate total
        setTotal(subtotal + (method === 'pickup' ? 0 : 60) + tax);
    };

    const handleTipSelection = (amount) => {
        setTipAmount(amount);
        setCustomTip(''); // Clear custom tip when selecting a preset amount
        calculateOrderSummary(orderItems); // Recalculate total
    };

    const handleCustomTipChange = (e) => {
        const value = e.target.value;
        setCustomTip(value);
        setTipAmount(null); // Clear preset selection
        calculateOrderSummary(orderItems); // Recalculate total
    };

    const handleCardNumberChange = (e) => {
        // Basic formatting and validation for card number
        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
        setCardNumber(value);
    };

    const handleExpiryChange = (e) => {
        // Format as MM/YY
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (value.length > 2) {
            setCardExpiry(value.slice(0, 2) + '/' + value.slice(2));
        } else {
            setCardExpiry(value);
        }
    };

    const handleCVVChange = (e) => {
        // Basic CVV validation
        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
        setCVV(value);
    };

    const handlePlaceOrder = () => {
        // Here you would typically send the order to your API
        console.log('Order placed!');
        alert('Your order has been placed successfully!');
        // In a real app, you'd navigate to an order confirmation page
        navigate('/dashboard');
    };

    const handleBackToCart = () => {
        navigate('/cart');
    };

    return (
        <div className="checkout-page-wrapper d-flex flex-column min-vh-100">
            <div className="container-fluid dashboard-header">
                <Header />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10 col-sm-12">
                            <h2 className="text-center text-white">Payment</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-4" style={{ background: "#EBEDF3" }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12 mb-4">
                            <div className="bg-white p-4 rounded shadow-sm">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading checkout information...</p>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Delivery Method Section */}
                                        <div className="delivery-method-options mb-4 ">
                                            <div className="d-flex align-items-center mb-3 ">
                                                <div className="form-check mr-4">
                                                    <input
                                                        type="radio"
                                                        id="pickup"
                                                        name="deliveryMethod"
                                                        className="form-check-input"
                                                        checked={deliveryMethod === 'pickup'}
                                                        onChange={() => handleDeliveryMethodChange('pickup')}
                                                    />
                                                    <label className="form-check-label" htmlFor="pickup">
                                                        Pick up
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        id="delivery"
                                                        name="deliveryMethod"
                                                        className="form-check-input"
                                                        checked={deliveryMethod === 'delivery'}
                                                        onChange={() => handleDeliveryMethodChange('delivery')}
                                                    />
                                                    <label className="form-check-label" htmlFor="delivery">
                                                        Delivery
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Methods Section */}
                                        <div className="mb-4">
                                            <h5 className="mb-3">Payment Options</h5>
                                            <div className="d-flex payment-options mb-3">
                                                <button
                                                    className={`btn ${paymentMethod === 'creditCard' ? 'btn-primary' : 'btn-outline-secondary'} mr-2`}
                                                    onClick={() => handlePaymentMethodChange('creditCard')}
                                                >
                                                    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                                    Credit or Debit Card
                                                </button>

                                                <button
                                                    className={`btn ${paymentMethod === 'cashOnDelivery' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => handlePaymentMethodChange('cashOnDelivery')}
                                                >
                                                    <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
                                                    Cash on Delivery
                                                </button>
                                            </div>

                                            {/* Credit Card Form */}
                                            {paymentMethod === 'creditCard' && (
                                                <div className="card-payment-form">
                                                    <div className="form-group mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Credit card number"
                                                            value={cardNumber}
                                                            onChange={handleCardNumberChange}
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
                                                                    onChange={handleExpiryChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="CVN"
                                                                    value={cardCVV}
                                                                    onChange={handleCVVChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tip Section */}
                                        {deliveryMethod === 'delivery' && (
                                            <div className="mb-4">
                                                <h5 className="mb-3">Tip for courier</h5>
                                                <div className="d-flex tip-options mb-3">
                                                    {[0, 1, 3, 5].map(amount => (
                                                        <button
                                                            key={amount}
                                                            className={`btn ${tipAmount === amount && !customTip ? 'btn-primary' : 'btn-outline-secondary'} mr-2`}
                                                            onClick={() => handleTipSelection(amount)}
                                                        >
                                                            {amount} TL
                                                        </button>
                                                    ))}
                                                </div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Enter custom amount"
                                                    value={customTip}
                                                    onChange={handleCustomTipChange}
                                                    min="0"
                                                />
                                            </div>
                                        )}

                                        {/* Delivery Address Section */}
                                        {deliveryMethod === 'delivery' && (
                                            <div className="delivery-address-section">
                                                <h5 className="mb-3" style={{ color: '#495057', fontWeight: '600' }}>Delivery Address</h5>

                                                <div
                                                    className={`address-option ${selectedAddress === 'savedAddress' ? 'selected' : ''}`}
                                                    onClick={() => setSelectedAddress('savedAddress')}
                                                >
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            id="savedAddress"
                                                            name="addressOption"
                                                            className="form-check-input"
                                                            checked={selectedAddress === 'savedAddress'}
                                                            onChange={() => setSelectedAddress('savedAddress')}
                                                        />
                                                        <label className="form-check-label" htmlFor="savedAddress">
                                                            <div className="address-text">
                                                                <strong>John Smith</strong><br />
                                                                132 My Street<br />
                                                                Kingston, New York 12401<br />
                                                                <span className="text-muted">Phone: (555) 123-4567</span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div
                                                    className={`address-option ${selectedAddress === 'workAddress' ? 'selected' : ''}`}
                                                    onClick={() => setSelectedAddress('workAddress')}
                                                >
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            id="workAddress"
                                                            name="addressOption"
                                                            className="form-check-input"
                                                            checked={selectedAddress === 'workAddress'}
                                                            onChange={() => setSelectedAddress('workAddress')}
                                                        />
                                                        <label className="form-check-label" htmlFor="workAddress">
                                                            <div className="address-text">
                                                                <strong>John Smith (Work)</strong><br />
                                                                456 Business Ave<br />
                                                                Suite 200, New York 10001<br />
                                                                <span className="text-muted">Phone: (555) 987-6543</span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="add-new-address">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                                    </svg>
                                                    Add New Address
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-12">
                            <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="mb-4">Order Summary</h4>

                                {orderItems.map(item => (
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
                                    className="btn btn-warning btn-block"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                >
                                    Place Order
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

export default CheckoutPage;