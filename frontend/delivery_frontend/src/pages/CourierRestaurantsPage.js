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
    faSort
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
        }
    };


    const handleCancelRequest = async (restaurantId) => {
        try {
            console.log(`Cancelling request for restaurant ID: ${restaurantId}`);

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
        }
    };
    const formatDate = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString();
    };

    const renderStatusButton = (restaurant) => {
        switch (restaurant.status) {
            case 'ACCEPTED':
                return (
                    <div className="status-container">
                        <div className="status-indicator registered">
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
                    <div>
                        <span className="badge bg-warning p-2 mb-2 d-block">
                            <FontAwesomeIcon icon={faHourglassHalf} className="mr-1" />
                            Pending Approval
                        </span>
                        <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelRequest(restaurant.restaurantId)}
                        >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Cancel Request
                        </button>
                    </div>
                );
            case 'NOT_REGISTERED':
                return (
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleRequestRegistration(restaurant.restaurantId)}
                    >
                        Request Registration
                    </button>
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

                            <div className="search-container mb-4">
                                <div className="input-group" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0 py-2"
                                        placeholder="Search for restaurants..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ height: '50px' }}
                                    />
                                    <button
                                        className="btn btn-orange btn-warning border-0"
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
                            <div className="bg-white p-4 dashboard-sidebar" style={{ minHeight: "450px" }}>
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faSort} className="mr-2 me-2" />
                                    Sort By
                                </h5>

                                <div className="list-group mb-4">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`list-group-item list-group-item-action ${sortOption === option.value ? 'active' : ''}`}
                                            onClick={() => setSortOption(option.value)}
                                        >
                                            <span className="icon-container d-inline-block text-center" style={{ width: '30px' }}>
                                                <FontAwesomeIcon icon={option.icon} />
                                            </span>
                                            <span className="ms-2">{option.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2 me-1" />
                                    Filter by Status
                                </h5>

                                <div className="list-group">
                                    {statusOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`list-group-item list-group-item-action ${filterOption === option.value ? 'active' : ''}`}
                                            onClick={() => setFilterOption(option.value)}
                                        >
                                            <span className="icon-container d-inline-block text-center" style={{ width: '30px' }}>
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
                            <div className="bg-white p-4 mb-4 d-flex justify-content-center align-items-center" style={{ minHeight: "450px" }}>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading restaurants...</p>
                                    </div>
                                ) : filteredRestaurants.length > 0 ? (
                                    <div className="restaurant-list w-100 px-2">
                                        {filteredRestaurants.map(restaurant => (
                                            <div className="restaurant-item mb-4" key={restaurant.restaurantId}>
                                                <div className="card restaurant-card w-100">
                                                    <div className="card-body">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-2">
                                                                <img
                                                                    src={restaurant.imageUrl || require("../assets/images/symbolshop.png")}
                                                                    alt={restaurant.name}
                                                                    className="img-fluid restaurant-image"
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
                                                                    <span className="ml-2">({restaurant.rating})</span>
                                                                </div>
                                                                <p className="card-text mb-1">
                                                                    <small><strong>Cuisine:</strong> {restaurant.cuisineType}</small>
                                                                </p>
                                                                <p className="card-text mb-1">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 me-1" />
                                                                    <small>{restaurant.address}</small>
                                                                </p>
                                                                <p className="card-text">
                                                                    <small><strong>Total Orders:</strong> {restaurant.totalOrders}</small>
                                                                </p>
                                                            </div>
                                                            <div className="col-md-3 text-right">
                                                                {renderStatusButton(restaurant)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center d-flex flex-column justify-content-center align-items-center" style={{ width: "100%" }}>
                                        <FontAwesomeIcon icon={faUtensils} size="4x" className="text-muted mb-4" />
                                        <h4>No restaurants found</h4>
                                        <p>Try adjusting your filters or search terms.</p>
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