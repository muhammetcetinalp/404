import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUtensils,
    faMapMarkerAlt,
    faFilter,
    faStar,
    faCheckCircle,
    faHourglassHalf,
    faTimes,
    faSearch,
    faFont,
    faThumbsUp,
    faSort,
    faStore
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import CourierIntegration from './CourierIntegration';
import '../styles/dashboard.css';
import '../styles/restaurant-dashboard.css';
import { jwtDecode } from 'jwt-decode';
import { AccountStatusBanner, checkAccountStatus } from '../components/AccountStatusBanner';

// Import restaurant images
import restaurantImg1 from '../assets/images/exampleRestaurants/image1.png';
import restaurantImg2 from '../assets/images/exampleRestaurants/image2.png';
import restaurantImg3 from '../assets/images/exampleRestaurants/image3.png';
import restaurantImg4 from '../assets/images/exampleRestaurants/image4.png';
import restaurantImg5 from '../assets/images/exampleRestaurants/image5.png';
import restaurantImg6 from '../assets/images/exampleRestaurants/image6.png';

const CourierRestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const [filterOption, setFilterOption] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingRegistration, setProcessingRegistration] = useState(null);
    const navigate = useNavigate();

    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    // Get courier ID from JWT token
    let courierId;
    try {
        const decoded = jwtDecode(token);
        courierId = decoded.id;
        console.log("Courier ID (from JWT):", courierId);
    } catch (error) {
        console.error("JWT decode error:", error);
    }

    const statusColors = {
        "ACCEPTED": "success",
        "PENDING": "warning",
        "NOT_REGISTERED": "secondary"
    };

    // Array of status options for filtering
    const statusOptions = [
        { value: 'all', label: 'All Restaurants', icon: faUtensils },
        { value: 'ACCEPTED', label: 'Registered Only', icon: faCheckCircle },
        { value: 'PENDING', label: 'Pending Approval', icon: faHourglassHalf },
        { value: 'NOT_REGISTERED', label: 'Not Registered', icon: faTimes }
    ];

    // Array of sort options
    const sortOptions = [
        { value: 'bestMatch', label: 'Best Match', icon: faThumbsUp },
        { value: 'name', label: 'Alphabetical', icon: faFont },
        { value: 'rating', label: 'Highest Rating', icon: faStar }
    ];

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Check account status
        if (!checkAccountStatus()) {
            return; // If BANNED, the checkAccountStatus function will handle redirection
        }

        // Fetch restaurants with user-specific registration status
        const fetchRestaurants = async () => {
            try {
                setLoading(true);

                // Tüm restoranları çek
                const response = await api.get(`/restaurants/public`);

                // Kurye-restoran ilişki durumunu çek
                const relationshipsResponse = await api.get(`/courier-requests/courier/${courierId}/restaurant-relationships`);
                const relationships = relationshipsResponse.data;

                // Restoranları ilişki durumuyla birleştir
                if (response.data && Array.isArray(response.data)) {
                    const restaurantsWithStatus = response.data.map(restaurant => {
                        const relationship = relationships.find(rel => rel.restaurantId === restaurant.restaurantId);
                        let status = "NOT_REGISTERED";

                        if (relationship) {
                            status = relationship.status;
                        }

                        // Add a default image based on index
                        const images = [restaurantImg1, restaurantImg2, restaurantImg3, restaurantImg4, restaurantImg5, restaurantImg6];
                        const randomIndex = Math.floor(Math.random() * images.length);

                        return {
                            ...restaurant,
                            status,
                            imageUrl: images[randomIndex],
                            totalOrders: relationship?.totalOrders || 0
                        };
                    });

                    setRestaurants(restaurantsWithStatus);
                    setFilteredRestaurants(restaurantsWithStatus);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching restaurants:', err);
                setError('Failed to load restaurant data. Showing example data instead.');
                setLoading(false);
                setError('Could not fetch restaurant data. Showing example data instead.');
            }
        };

        fetchRestaurants();
    }, [token, navigate, courierId]);

    useEffect(() => {
        let results = restaurants;

        // Apply search filter
        if (searchTerm) {
            results = results.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.cuisineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (filterOption !== 'all') {
            results = results.filter(restaurant => restaurant.status === filterOption);
        }

        // Apply sorting
        switch (sortOption) {
            case 'name':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            case 'bestMatch':
            default:
                break;
        }

        setFilteredRestaurants(results);
    }, [sortOption, filterOption, searchTerm, restaurants]);

    const handleRequestRegistration = async (restaurantId) => {
        try {
            setProcessingRegistration(restaurantId);
            await CourierIntegration.sendRestaurantRequest(courierId, restaurantId);

            // Update local state to reflect the change
            const updatedRestaurants = restaurants.map(restaurant => {
                if (restaurant.restaurantId === restaurantId) {
                    return {
                        ...restaurant,
                        status: "PENDING",
                        registerDate: new Date().toISOString()
                    };
                }
                return restaurant;
            });

            setRestaurants(updatedRestaurants);
            setFilteredRestaurants(
                updatedRestaurants.filter(r =>
                    filterOption === 'all' || r.status === filterOption
                )
            );
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to request registration. Please try again.');
        } finally {
            setProcessingRegistration(null);
        }
    };


    const handleCancelRequest = async (restaurantId) => {
        try {
            console.log(`Cancelling request for restaurant ID: ${restaurantId}`);
            setProcessingRegistration(restaurantId);

            // API isteği
            await api.post('/courier-requests/cancel', null, {
                params: {
                    courierId: courierId,
                    restaurantId: restaurantId
                }
            });

            console.log("API call successful");

            // Lokal state'i güncelle
            const updatedRestaurants = restaurants.map(restaurant => {
                if (restaurant.restaurantId === restaurantId) {
                    return {
                        ...restaurant,
                        status: "NOT_REGISTERED"
                    };
                }
                return restaurant;
            });

            // State güncelleme
            setRestaurants(updatedRestaurants);
            setFilteredRestaurants(
                updatedRestaurants.filter(r =>
                    filterOption === 'all' || r.status === filterOption
                )
            );

            console.log("States updated");

        } catch (error) {
            console.error('Error cancelling request:', error);
            // Hata durumunda kullanıcıya bildir
        } finally {
            setProcessingRegistration(null);
        }
    };
    const formatDate = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString();
    };

    const renderStatusButton = (restaurant) => {
        const isProcessing = processingRegistration === restaurant.restaurantId;

        switch (restaurant.status) {
            case 'ACCEPTED':
                return (
                    <div className="status-container">
                        <div className="status-indicator registered" style={{ backgroundColor: '#eb6825' }}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div className="status-text">
                            <span className="status-label">Registered</span>
                            <span className="status-date">{formatDate(restaurant.registerDate)}</span>
                        </div>
                    </div>
                );
            case 'PENDING':
                return (
                    <div style={{ minHeight: '72px' }}>
                        <span className="btn-pending-approval badge bg-warning p-2 mb-2 d-block text-white">
                            <FontAwesomeIcon icon={faHourglassHalf} className="me-2" />
                            Pending Approval
                        </span>
                        <button
                            className="btn btn-outline-danger btn-sm w-100"
                            onClick={() => handleCancelRequest(restaurant.restaurantId)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                                    Cancel Request
                                </>
                            )}
                        </button>
                    </div>
                );
            case 'NOT_REGISTERED':
                return (
                    <div style={{ minHeight: '72px', display: 'flex', alignItems: 'center' }}>
                        <button
                            className="btn btn-orange btn-warning btn-sm w-100"
                            onClick={() => handleRequestRegistration(restaurant.restaurantId)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faStore} className="me-1" />
                                    Request Registration
                                </>
                            )}
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="container-fluid dashboard-header">
                <Header />
                <AccountStatusBanner />
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-10 col-sm-12">
                            <div className="search-container mb-4 d-flex justify-content-center">
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    borderRadius: '25px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Search for restaurants..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            flex: 1,
                                            height: '50px',
                                            border: 'none',
                                            paddingLeft: '20px',
                                            fontSize: '16px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        style={{
                                            width: '60px',
                                            height: '50px',
                                            backgroundColor: '#eb6825',
                                            border: 'none',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-4" style={{ background: "#EBEDF3", minHeight: "70vh" }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row">
                        {/* Left Sidebar - Filters and Sorting */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar rounded shadow-sm">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faSort} className="me-2" />
                                    Sort By
                                </h5>

                                <div className="list-group mb-4">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`list-group-item list-group-item-action ${sortOption === option.value ? 'active' : ''}`}
                                            onClick={() => setSortOption(option.value)}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={option.icon} />
                                            </span>
                                            <span className="ms-2">{option.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="me-1" />
                                    Filter by Status
                                </h5>

                                <div className="list-group">
                                    {statusOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`list-group-item list-group-item-action ${filterOption === option.value ? 'active' : ''}`}
                                            onClick={() => setFilterOption(option.value)}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={option.icon} />
                                            </span>
                                            <span className="ms-2">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Restaurants */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="mb-4 border-bottom pb-2">Available Restaurants</h4>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading restaurants...</p>
                                    </div>
                                ) : filteredRestaurants.length > 0 ? (
                                    <div className="restaurant-list">
                                        {filteredRestaurants.map(restaurant => (
                                            <div className="restaurant-item mb-4" key={restaurant.restaurantId}>
                                                <div className="card restaurant-card">
                                                    <div className="card-body">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-2">
                                                                <img
                                                                    src={restaurant.imageUrl || require("../assets/images/symbolshop.png")}
                                                                    alt={restaurant.name}
                                                                    className="img-fluid rounded"
                                                                    style={{ height: "80px", objectFit: "cover", width: "100%" }}
                                                                />
                                                            </div>
                                                            <div className="col-md-7">
                                                                <h5 className="card-title">{restaurant.name}</h5>
                                                                <div className="rating mb-2">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <FontAwesomeIcon
                                                                            key={i}
                                                                            icon={faStar}
                                                                            className={i < Math.floor(restaurant.rating) ? 'text-warning' : 'text-muted'}
                                                                        />
                                                                    ))}
                                                                    <span className="ms-2">({restaurant.rating})</span>
                                                                </div>
                                                                <p className="restorant-card-text card-text mb-1 small">
                                                                    <strong>Cuisine:</strong> {restaurant.cuisineType}
                                                                </p>
                                                                <p className="restorant-card-text card-text mb-1 small">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-1" />
                                                                    {restaurant.address}
                                                                </p>
                                                                <p className="restorant-card-text card-text small">
                                                                    <strong>Total Orders:</strong> {restaurant.totalOrders}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-3 text-end">
                                                                {renderStatusButton(restaurant)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faUtensils} size="3x" className="text-muted mb-3" />
                                        <h5>No restaurants found</h5>
                                        <p className="text-muted">Try adjusting your filters or search terms.</p>
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

export default CourierRestaurantsPage;