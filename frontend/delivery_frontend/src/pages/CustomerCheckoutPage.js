import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMoneyBill, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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
    const [accountStatus, setAccountStatus] = useState('ACTIVE');

    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);

    // Özel kapatma butonu
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

    // Toplam hesaplama fonksiyonu
    const calculateTotals = (items, method, customTipOverride = null) => {
        const sub = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const tax = 5;
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Profil bilgisini al
                const profileRes = await api.get('/profile');

                // Hesap durumunu kontrol et
                const accountStatus = profileRes.data.profile?.accountStatus;
                setAccountStatus(accountStatus || 'ACTIVE');

                if (accountStatus === 'BANNED') {
                    toast.error('Your account has been banned. You cannot place orders.', {
                        closeButton: <CustomCloseButton />
                    });
                    setTimeout(() => {
                        navigate('/customer-dashboard');
                    }, 2000);
                    return;
                }

                if (accountStatus === 'SUSPENDED') {
                    toast.error('Your account has been suspended. You cannot place orders at this time.', {
                        closeButton: <CustomCloseButton />
                    });
                    setTimeout(() => {
                        navigate('/customer-dashboard');
                    }, 2000);
                    return;
                }

                // Sepeti kontrol et
                const cartRes = await api.get('/cart/showcart');
                setCartItems(cartRes.data);
                setAddress(profileRes.data.profile.address || '');
                calculateTotals(cartRes.data);

                // Restoran teslimat tipi bilgisini al
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

                // Hata mesajını göster
                const errorMessage = err.response?.data || "Failed to load checkout data.";
                toast.error(errorMessage, {
                    closeButton: <CustomCloseButton />
                });

                if (err.response?.status === 403) {
                    // Eğer yasaklanmış ya da askıya alınmışsa ana sayfaya geri dön
                    setTimeout(() => {
                        navigate('/customer-dashboard');
                    }, 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handlePlaceOrder = async () => {
        try {
            if (paymentMethod === 'creditCard') {
                // Kart bilgilerini doğrula
                const cardNumberDigits = cardNumber.replace(/\s/g, ''); // boşlukları sil
                if (cardNumberDigits.length !== 16) {
                    toast.error("Please enter a valid 16-digit card number!", {
                        closeButton: <CustomCloseButton />
                    });
                    return;
                }

                if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                    toast.error("Please enter a valid expiry date (MM/YY)!", {
                        closeButton: <CustomCloseButton />
                    });
                    return;
                }

                const [expMonth, expYear] = cardExpiry.split('/').map(num => parseInt(num, 10));

                // Ayın 1 ile 12 arasında olup olmadığını kontrol et
                if (expMonth < 1 || expMonth > 12) {
                    toast.error("Expiry month must be between 01 and 12!", {
                        closeButton: <CustomCloseButton />
                    });
                    return;
                }

                // Yıl ve ay günümüzden eski mi diye kontrol et
                const now = new Date();
                const currentYear = now.getFullYear() % 100; // Son iki rakamı alıyoruz, mesela 2025 -> 25
                const currentMonth = now.getMonth() + 1; // getMonth() 0-11 arası verir, +1 yapıyoruz

                if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                    toast.error("Expiry date cannot be in the past!", {
                        closeButton: <CustomCloseButton />
                    });
                    return;
                }


                if (cardCVV.length !== 3) {
                    toast.error("Please enter a valid 3-digit CVV!", {
                        closeButton: <CustomCloseButton />
                    });
                    return;
                }
            }

            // Profil bilgisini yeniden kontrol et (hesap durumu değişmiş olabilir)
            const profileRes = await api.get('/profile');
            const currentStatus = profileRes.data.profile?.accountStatus;

            if (currentStatus === 'BANNED' || currentStatus === 'SUSPENDED') {
                toast.error(`Your account has been ${currentStatus.toLowerCase()}. You cannot place orders at this time.`, {
                    closeButton: <CustomCloseButton />
                });
                setTimeout(() => {
                    navigate('/customer-dashboard');
                }, 2000);
                return;
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

            toast.success('Order placed successfully!');

            setTimeout(() => {
                navigate('/customer-dashboard');
            }, 2000);

        } catch (err) {
            const message = err.response?.data?.message || err.response?.data || err.message;
            console.error("Order error", message);
            toast.error('Order failed: ' + message, {
                closeButton: <CustomCloseButton />
            });
        }
    };

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
                closeButton={<CustomCloseButton />}
                toastClassName="custom-toast"
                bodyClassName="custom-toast-body"
                icon={true}
            />

            <div className="container-fluid py-4" style={{ background: "#EBEDF3", minHeight: "60vh" }}>
                <div className="container">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-warning" role="status"></div>
                            <p className="mt-3">Loading...</p>
                        </div>
                    ) : (
                        <div className="row">
                            {accountStatus === 'SUSPENDED' && (
                                <div className="col-12 mb-4">
                                    <div className="alert alert-warning" role="alert">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                        <strong>Your account has been suspended!</strong> You cannot place orders at this time.
                                        Please contact support for assistance.
                                    </div>
                                </div>
                            )}

                            <div className="col-lg-8">
                                <div className="bg-white p-4 rounded shadow-sm mb-4">
                                    <h5>Delivery Method</h5>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="pickup"
                                            name="delivery"
                                            className="form-check-input"
                                            checked={deliveryMethod === 'pickup'}
                                            onChange={() => {
                                                setDeliveryMethod('pickup');
                                                calculateTotals(cartItems, 'pickup');
                                            }}
                                            disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                        />
                                        <label htmlFor="pickup" className="form-check-label text-dark">Pickup</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="delivery"
                                            name="delivery"
                                            className="form-check-input"
                                            checked={deliveryMethod === 'delivery'}
                                            onChange={() => {
                                                setDeliveryMethod('delivery');
                                                calculateTotals(cartItems, 'delivery');
                                            }}
                                            disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                        />
                                        <label htmlFor="delivery" className="form-check-label text-dark">Delivery</label>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded shadow-sm mb-4">
                                    <h5>Payment Method</h5>
                                    <div className="d-flex payment-options mb-3">
                                        <button
                                            className={`btn ${paymentMethod === 'creditCard' ? 'btn-primary' : 'btn-outline-secondary'} mr-2`}
                                            onClick={() => setPaymentMethod('creditCard')}
                                            disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                        >
                                            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                            Credit or Debit Card
                                        </button>

                                        <button
                                            className={`btn ${paymentMethod === 'cashOnDelivery' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setPaymentMethod('cashOnDelivery')}
                                            disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
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
                                                    className="form-control custom-card-input"
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
                                                    disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                                />

                                            </div>
                                            <div className="row g-3">
                                                <div className="col-6 pe-2">
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            className="form-control custom-card-input"
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
                                                            disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6 ps-2">
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            className="form-control custom-card-input"
                                                            placeholder="CVV"
                                                            value={cardCVV}
                                                            onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                            disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
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
                                                    disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
                                                >
                                                    {tip} TL
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control custom-card-input"
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
                                            disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
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
                                        disabled={accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
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
                                        <span>Delivery Fee</span>
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
                                        disabled={loading || accountStatus === 'SUSPENDED' || accountStatus === 'BANNED'}
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