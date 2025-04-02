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
import '../styles/dashboard.css';
import '../styles/restaurant-dashboard.css';

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

    const statusColors = {
        "registered": "success",
        "pending": "warning",
        "not_registered": "secondary"
    };

    // Array of status options for filtering
    const statusOptions = [
        { value: 'all', label: 'All Restaurants', icon: faUtensils },
        { value: 'registered', label: 'Registered Only', icon: faCheckCircle },
        { value: 'pending', label: 'Pending Approval', icon: faHourglassHalf },
        { value: 'not_registered', label: 'Not Registered', icon: faTimes }
    ];

    // Array of sort options
    const sortOptions = [
        { value: 'name', label: 'Restaurant Name', icon: faFont },
        { value: 'rating', label: 'Highest Rating', icon: faStar },
        { value: 'orders', label: 'Most Orders', icon: faSort }
    ];

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Enhanced example restaurants data with images
        const exampleRestaurants = [
            {
                id: 1,
                name: "Apple Jabba",
                cuisine: "Italian",
                location: "123 Main St, City",
                rating: 4.7,
                totalOrders: 156,
                status: "registered",
                registerDate: "2025-01-15T10:30:00",
                imageUrl: restaurantImg1
            },
            {
                id: 2,
                name: "BB.Q Chicken",
                cuisine: "Korean Fried Chicken",
                location: "789 Broadway, City",
                rating: 4.5,
                totalOrders: 89,
                status: "pending",
                registerDate: "2025-03-28T14:00:00",
                imageUrl: restaurantImg2
            },
            {
                id: 3,
                name: "Beef Rosati",
                cuisine: "Steakhouse",
                location: "567 5th Ave, City",
                rating: 4.8,
                totalOrders: 210,
                status: "not_registered",
                registerDate: null,
                imageUrl: restaurantImg3
            },
            {
                id: 4,
                name: "Istanbul Kebab",
                cuisine: "Turkish",
                location: "432 Oak St, City",
                rating: 4.6,
                totalOrders: 178,
                status: "registered",
                registerDate: "2025-02-20T09:15:00",
                imageUrl: restaurantImg4
            },
            {
                id: 5,
                name: "Sushi Master",
                cuisine: "Japanese",
                location: "901 Pine St, City",
                rating: 4.9,
                totalOrders: 312,
                status: "not_registered",
                registerDate: null,
                imageUrl: restaurantImg5
            },
            {
                id: 6,
                name: "Taj Mahal",
                cuisine: "Indian",
                location: "345 Elm St, City",
                rating: 4.4,
                totalOrders: 95,
                status: "pending",
                registerDate: "2025-03-30T11:45:00",
                imageUrl: restaurantImg6
            }
        ];

        setRestaurants(exampleRestaurants);
        setFilteredRestaurants(exampleRestaurants);
        setLoading(false);

        //  fetch data from API
    }, [token, navigate]);

    useEffect(() => {
        let results = restaurants;

        // Apply search filter
        if (searchTerm) {
            results = results.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
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
            case 'orders':
                results.sort((a, b) => b.totalOrders - a.totalOrders);
                break;
            default:
                break;
        }

        setFilteredRestaurants(results);
    }, [sortOption, filterOption, searchTerm, restaurants]);

    const handleRequestRegistration = async (restaurantId) => {
        try {
            const updatedRestaurants = restaurants.map(restaurant => {
                if (restaurant.id === restaurantId) {
                    return {
                        ...restaurant,
                        status: "pending",
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
            //  update the local state
            const updatedRestaurants = restaurants.map(restaurant => {
                if (restaurant.id === restaurantId) {
                    return {
                        ...restaurant,
                        status: "not_registered",
                        registerDate: null
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
            setError('Failed to cancel registration request. Please try again.');
        }
    };

    const formatDate = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString();
    };

    const renderStatusButton = (restaurant) => {
        switch (restaurant.status) {
            case 'registered':
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
            case 'pending':
                return (
                    <div>
                        <span className="badge bg-warning p-2 mb-2 d-block">
                            <FontAwesomeIcon icon={faHourglassHalf} className="mr-1" />
                            Pending Approval
                        </span>
                        <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelRequest(restaurant.id)}
                        >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Cancel Request
                        </button>
                    </div>
                );
            case 'not_registered':
                return (
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleRequestRegistration(restaurant.id)}
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
                <div className="container dashboard-welcome-text">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-10 col-sm-12">
                            <h1 className="display-4 text-white mb-4">Restaurant Network</h1>
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
                                        className="btn btn-warning border-0"
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

            <div className="container-fluid py-4" style={{ background: "#EBEDF3" }}>
                <div className="container">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="row">
                        {/* Left Sidebar - Filters and Sorting */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
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
                                            <span className="ml-2">{option.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
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
                                            <span className="ml-2">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Restaurants */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 mb-4">


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
                                            <div className="restaurant-item mb-4" key={restaurant.id}>
                                                <div className="card restaurant-card">
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
                                                                    <small><strong>Cuisine:</strong> {restaurant.cuisine}</small>
                                                                </p>
                                                                <p className="card-text mb-1">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                                                    <small>{restaurant.location}</small>
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
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faUtensils} size="3x" className="text-muted mb-3" />
                                        <h5>No restaurants found</h5>
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