import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMotorcycle, faUserPlus, faCheckCircle, faTimesCircle, faSort, faUser, faPhone, faEnvelope, faIdCard, faCheck, faTimes, faTasks } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import '../styles/restaurant-dashboard.css';
import '../styles/dashboard.css';
import { AccountStatusBanner, checkAccountStatus } from '../components/AccountStatusBanner';
import CourierIntegration from './CourierIntegration';

const RestaurantCourierManagementPage = () => {
    const [registeredCouriers, setRegisteredCouriers] = useState([]);
    const [pendingCouriers, setPendingCouriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRegisteredCouriers, setFilteredRegisteredCouriers] = useState([]);
    const [filteredPendingCouriers, setFilteredPendingCouriers] = useState([]);
    const [accountStatus, setAccountStatus] = useState('ACTIVE');
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    // Get restaurant ID from JWT token
    let restaurantId;
    try {
        const decoded = jwtDecode(token);
        restaurantId = decoded.id;
        console.log("Restaurant ID (from JWT):", restaurantId);
    } catch (error) {
        console.error("JWT decode error:", error);
        // Fall back to localStorage
        restaurantId = localStorage.getItem('restaurantId');
        console.log("Restaurant ID (from localStorage):", restaurantId);
    }

    // Headers for API requests
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Custom close button for toast notifications
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

    // Fetch restaurant profile to check account status
    const fetchRestaurantProfile = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8080/api/profile',
                { headers }
            );
            console.log("Restaurant profile:", response.data);

            if (response.data && response.data.accountStatus) {
                setAccountStatus(response.data.accountStatus);
            }
        } catch (err) {
            console.error('Error fetching restaurant profile:', err);
        }
    };

    // Fetch courier requests
    const fetchCourierRequests = async () => {
        try {
            setLoading(true);
            // Check account status first
            if (!checkAccountStatus()) {
                return; // If BANNED or issues, the function will handle redirection
            }

            // Fetch pending requests
            const response = await api.get(`/courier-requests/restaurant/${restaurantId}`);

            if (response.data && Array.isArray(response.data)) {
                // Filter requests by status
                const pending = response.data.filter(req => req.status === 'PENDING');
                const registered = response.data.filter(req => req.status === 'ACCEPTED');

                setPendingCouriers(pending);
                setRegisteredCouriers(registered);
                setFilteredPendingCouriers(pending);
                setFilteredRegisteredCouriers(registered);
            } else {
                throw new Error('Invalid data format');
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching courier requests:', err);
            setError('Failed to load courier data. Please try again later.');
            setLoading(false);
        }
    };

    // Accept a pending courier
    const handleAcceptCourier = async (requestId) => {
        try {
            // Check if restaurant is suspended
            if (accountStatus === 'SUSPENDED') {
                toast.error('Your restaurant is suspended. You cannot accept new couriers.');
                return;
            }

            console.log(`Accepting courier request ${requestId}`);

            // Call the integration service to accept the request
            await CourierIntegration.respondToRequest(requestId, 'ACCEPT');

            // Refresh courier lists
            await fetchCourierRequests();

            toast.success('Courier accepted successfully!');
        } catch (err) {
            console.error('Error accepting courier:', err);
            const errorMessage = err.response?.data || 'Failed to accept courier. Please try again.';
            toast.error(errorMessage);
        }
    };

    // Decline a pending courier
    const handleDeclineCourier = async (requestId) => {
        try {
            console.log(`Declining courier request ${requestId}`);

            // Call the integration service to reject the request
            await CourierIntegration.respondToRequest(requestId, 'REJECT');

            // Refresh courier lists
            await fetchCourierRequests();

            toast.success('Courier request declined successfully!');
        } catch (err) {
            console.error('Error declining courier:', err);
            const errorMessage = err.response?.data || 'Failed to decline courier. Please try again.';
            toast.error(errorMessage);
        }
    };

    // Remove a registered courier
    const handleRemoveCourier = async (requestId) => {
        try {
            // Check if restaurant is suspended
            if (accountStatus === 'SUSPENDED') {
                toast.error('Your restaurant is suspended. You cannot remove couriers.');
                return;
            }

            console.log(`Removing courier request ${requestId}`);

            // In a real application, you would have an API endpoint for removing couriers
            // For now, we'll reject the request (which effectively removes the relationship)
            await CourierIntegration.respondToRequest(requestId, 'REJECT');

            // Refresh courier lists
            await fetchCourierRequests();

            toast.success('Courier removed successfully!');
        } catch (err) {
            console.error('Error removing courier:', err);
            const errorMessage = err.response?.data || 'Failed to remove courier. Please try again.';
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchRestaurantProfile();
        fetchCourierRequests();
    }, [token, navigate, restaurantId]);

    // Filter couriers based on search term
    useEffect(() => {
        if (searchTerm) {
            const filteredRegistered = registeredCouriers.filter(courier =>
                courier.courierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                courier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                courier.phone?.includes(searchTerm)
            );

            const filteredPending = pendingCouriers.filter(courier =>
                courier.courierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                courier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                courier.phone?.includes(searchTerm)
            );

            setFilteredRegisteredCouriers(filteredRegistered);
            setFilteredPendingCouriers(filteredPending);
        } else {
            setFilteredRegisteredCouriers(registeredCouriers);
            setFilteredPendingCouriers(pendingCouriers);
        }
    }, [searchTerm, registeredCouriers, pendingCouriers]);

    // Get the current couriers to display based on active tab
    const getCurrentCouriers = () => {
        if (activeTab === 'registered') {
            return filteredRegisteredCouriers;
        } else if (activeTab === 'pending') {
            return filteredPendingCouriers;
        } else {
            return [...filteredRegisteredCouriers, ...filteredPendingCouriers];
        }
    };

    // Get tab title based on active tab
    const getTabTitle = () => {
        if (activeTab === 'registered') {
            return 'Registered Couriers';
        } else if (activeTab === 'pending') {
            return 'Pending Courier Requests';
        } else {
            return 'All Couriers';
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container-fluid dashboard-header">
                <Header />
                <AccountStatusBanner />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-10 col-sm-12">
                            <div className="search-container mb-4">
                                <div className="input-group" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0 py-2"
                                        placeholder="Search couriers by name, email or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ height: '50px' }}
                                    />
                                    <button
                                        className="btn-orange btn btn-warning border-0"
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

            <div className="flex-grow-1" style={{ background: "#EBEDF3", minHeight: "70vh" }}>
                <div className="container-fluid py-4" style={{ background: "#EBEDF3" }}>
                    <div className="container">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {accountStatus === 'SUSPENDED' && (
                            <div className="alert alert-warning" role="alert">
                                <strong>Your restaurant account has been suspended!</strong> You cannot accept new couriers or modify existing courier relationships.
                                Please contact support for assistance.
                            </div>
                        )}

                        {/* Status Filter Bar */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-body p-0">
                                        <div className="status-filter-bar d-flex">
                                            <div
                                                className={`status-item flex-fill text-center p-3 cursor-pointer ${activeTab === 'all' ? 'active bg-light border-bottom border-warning' : ''}`}
                                                onClick={() => setActiveTab('all')}
                                            >
                                                <FontAwesomeIcon icon={faTasks} className="me-2" />
                                                All Couriers
                                                <span className="badge bg-secondary ms-2">{registeredCouriers.length + pendingCouriers.length}</span>
                                            </div>
                                            <div
                                                className={`status-item flex-fill text-center p-3 cursor-pointer ${activeTab === 'registered' ? 'active bg-light border-bottom border-warning' : ''}`}
                                                onClick={() => setActiveTab('registered')}
                                            >
                                                <FontAwesomeIcon icon={faMotorcycle} className="me-2 text-success" />
                                                Registered
                                                <span className="badge bg-success ms-2">{registeredCouriers.length}</span>
                                            </div>
                                            <div
                                                className={`status-item flex-fill text-center p-3 cursor-pointer ${activeTab === 'pending' ? 'active bg-light border-bottom border-warning' : ''}`}
                                                onClick={() => setActiveTab('pending')}
                                            >
                                                <FontAwesomeIcon icon={faUserPlus} className="me-2 text-warning" />
                                                Pending
                                                <span className="badge bg-warning ms-2">{pendingCouriers.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courier Display Section */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">
                                            {getTabTitle()}
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <div className="text-orange spinner-border text-warning" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                                <p className="mt-2">Loading couriers...</p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Registered Couriers */}
                                                {activeTab === 'registered' && (
                                                    <>
                                                        {filteredRegisteredCouriers.length > 0 ? (
                                                            <div className="table-responsive">
                                                                <table className="table table-hover">
                                                                    <thead className="table-light">
                                                                        <tr>
                                                                            <th scope="col" width="25%">Name</th>
                                                                            <th scope="col" width="25%">Email</th>
                                                                            <th scope="col" width="20%">Phone</th>
                                                                            <th scope="col" width="10%">Status</th>
                                                                            <th scope="col" width="20%" className="text-end">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {filteredRegisteredCouriers.map(courier => (
                                                                            <tr key={courier.requestId}>
                                                                                <td className="align-middle">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className="avatar-circle me-2 bg-warning">
                                                                                            <span className="avatar-text">{courier.courierName.charAt(0).toUpperCase()}</span>
                                                                                        </div>
                                                                                        {courier.courierName}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="align-middle">{courier.email || 'N/A'}</td>
                                                                                <td className="align-middle">{courier.phone || 'N/A'}</td>
                                                                                <td className="align-middle">
                                                                                    <span className="badge bg-success">Active</span>
                                                                                </td>
                                                                                <td className="align-middle text-end">
                                                                                    <button
                                                                                        className="btn btn-outline-danger btn-sm"
                                                                                        onClick={() => handleRemoveCourier(courier.requestId)}
                                                                                        disabled={accountStatus === 'SUSPENDED'}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                                                        Remove
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <FontAwesomeIcon icon={faMotorcycle} size="3x" className="mb-3 text-muted" />
                                                                <h5>No registered couriers found</h5>
                                                                <p>There are no couriers currently registered with your restaurant</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Pending Couriers */}
                                                {activeTab === 'pending' && (
                                                    <>
                                                        {filteredPendingCouriers.length > 0 ? (
                                                            <div className="table-responsive">
                                                                <table className="table table-hover">
                                                                    <thead className="table-light">
                                                                        <tr>
                                                                            <th scope="col" width="25%">Name</th>
                                                                            <th scope="col" width="25%">Email</th>
                                                                            <th scope="col" width="20%">Phone</th>
                                                                            <th scope="col" width="10%">Status</th>
                                                                            <th scope="col" width="20%" className="text-end">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {filteredPendingCouriers.map(courier => (
                                                                            <tr key={courier.requestId}>
                                                                                <td className="align-middle">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className="avatar-circle me-2 bg-secondary">
                                                                                            <span className="avatar-text">{courier.courierName.charAt(0).toUpperCase()}</span>
                                                                                        </div>
                                                                                        {courier.courierName}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="align-middle">{courier.email || 'N/A'}</td>
                                                                                <td className="align-middle">{courier.phone || 'N/A'}</td>
                                                                                <td className="align-middle">
                                                                                    <span className="badge bg-warning">Pending</span>
                                                                                </td>
                                                                                <td className="align-middle text-end">
                                                                                    <div className="btn-group" role="group">
                                                                                        <button
                                                                                            className="btn btn-success btn-sm"
                                                                                            onClick={() => handleAcceptCourier(courier.requestId)}
                                                                                            disabled={accountStatus === 'SUSPENDED'}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                                            Accept
                                                                                        </button>
                                                                                        <button
                                                                                            className="btn btn-danger btn-sm"
                                                                                            onClick={() => handleDeclineCourier(courier.requestId)}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                                                            Decline
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <FontAwesomeIcon icon={faUserPlus} size="3x" className="mb-3 text-muted" />
                                                                <h5>No pending courier requests</h5>
                                                                <p>There are no couriers waiting for approval</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* All Couriers */}
                                                {activeTab === 'all' && (
                                                    <>
                                                        {filteredRegisteredCouriers.length > 0 || filteredPendingCouriers.length > 0 ? (
                                                            <div className="table-responsive">
                                                                <table className="table table-hover">
                                                                    <thead className="table-light">
                                                                        <tr>
                                                                            <th scope="col" width="25%">Name</th>
                                                                            <th scope="col" width="25%">Email</th>
                                                                            <th scope="col" width="20%">Phone</th>
                                                                            <th scope="col" width="10%">Status</th>
                                                                            <th scope="col" width="20%" className="text-end">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {filteredRegisteredCouriers.map(courier => (
                                                                            <tr key={`registered-${courier.requestId}`}>
                                                                                <td className="align-middle">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className="avatar-circle me-2 bg-warning">
                                                                                            <span className="avatar-text">{courier.courierName.charAt(0).toUpperCase()}</span>
                                                                                        </div>
                                                                                        {courier.courierName}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="align-middle">{courier.email || 'N/A'}</td>
                                                                                <td className="align-middle">{courier.phone || 'N/A'}</td>
                                                                                <td className="align-middle">
                                                                                    <span className="badge bg-success">Active</span>
                                                                                </td>
                                                                                <td className="align-middle text-end">
                                                                                    <button
                                                                                        className="btn btn-outline-danger btn-sm"
                                                                                        onClick={() => handleRemoveCourier(courier.requestId)}
                                                                                        disabled={accountStatus === 'SUSPENDED'}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                                                        Remove
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}

                                                                        {filteredPendingCouriers.map(courier => (
                                                                            <tr key={`pending-${courier.requestId}`}>
                                                                                <td className="align-middle">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className="avatar-circle me-2 bg-secondary">
                                                                                            <span className="avatar-text">{courier.courierName.charAt(0).toUpperCase()}</span>
                                                                                        </div>
                                                                                        {courier.courierName}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="align-middle">{courier.email || 'N/A'}</td>
                                                                                <td className="align-middle">{courier.phone || 'N/A'}</td>
                                                                                <td className="align-middle">
                                                                                    <span className="badge bg-warning">Pending</span>
                                                                                </td>
                                                                                <td className="align-middle text-end">
                                                                                    <div className="btn-group" role="group">
                                                                                        <button
                                                                                            className="btn btn-success btn-sm"
                                                                                            onClick={() => handleAcceptCourier(courier.requestId)}
                                                                                            disabled={accountStatus === 'SUSPENDED'}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                                            Accept
                                                                                        </button>
                                                                                        <button
                                                                                            className="btn btn-danger btn-sm"
                                                                                            onClick={() => handleDeclineCourier(courier.requestId)}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                                                            Decline
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <FontAwesomeIcon icon={faMotorcycle} size="3x" className="mb-3 text-muted" />
                                                                <h5>No couriers found</h5>
                                                                <p>There are no couriers registered or pending approval</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
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

export default RestaurantCourierManagementPage;