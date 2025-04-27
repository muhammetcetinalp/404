import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faStar, faFilter, faSortAmountDown, faFont,
    faThumbsUp, faChevronDown, faChevronUp, faHeart, faPlus, faShoppingCart, faTimes
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';

const CustomerDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('bestMatch');
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState({});
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedItemIds, setAddedItemIds] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [cartError, setCartError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    const categories = [
        'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Turkish'
    ];

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/public/search-restaurants');
                console.log('API Response:', response.data);
                setRestaurants(response.data);
                setFilteredRestaurants(response.data);
            } catch (err) {
                console.error('Error fetching restaurants:', err);
                setError('Failed to fetch restaurants.');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [token, navigate]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get('/profile/favorites');
                // Extract just the restaurant IDs from the response if needed
                const favoriteIds = response.data.map(restaurant => restaurant.restaurantId);
                setFavoriteRestaurants(favoriteIds);
            } catch (err) {
                console.error('Error fetching favorites:', err);
                // Silently fail - favorites are not critical
                setFavoriteRestaurants([]);
            }
        };

        if (token) {
            fetchFavorites();
        }
    }, [token]);

    useEffect(() => {
        let results = [...restaurants];

        if (searchTerm) {
            results = results.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.cuisineType?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategories.length > 0) {
            results = results.filter(restaurant =>
                selectedCategories.includes(restaurant.cuisineType)
            );
        }

        switch (sortOption) {
            case 'alphabetical':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            case 'favorites':
                results.sort((a, b) => {
                    const aFav = favoriteRestaurants.includes(a.restaurantId);
                    const bFav = favoriteRestaurants.includes(b.restaurantId);
                    return bFav - aFav;
                });
                break;
            case 'bestMatch':
            default:
                break;
        }

        setFilteredRestaurants(results);
    }, [searchTerm, sortOption, selectedCategories, restaurants, favoriteRestaurants]);

    const handleViewRestaurant = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        setLoadingMenu(true);
        setShowModal(true);

        try {
            // Check if we already have the menu items for this restaurant
            if (!menuItems[restaurant.restaurantId]) {
                const response = await api.get(`/restaurants/${restaurant.restaurantId}/menu`);
                setMenuItems(prev => ({
                    ...prev,
                    [restaurant.restaurantId]: response.data
                }));
            }
        } catch (err) {
            console.error('Error fetching menu items:', err);
        } finally {
            setLoadingMenu(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRestaurant(null);
        setCartError('');
    };

    const handleAddToCart = async (item, restaurantId) => {
        if (addingToCart) return;

        const selectedRest = restaurants.find(r => r.restaurantId === restaurantId);
        if (!selectedRest?.open) {
            alert('This restaurant is currently closed. You cannot add items to your cart.');
            return;
        }

        setAddingToCart(true);
        setCartError('');

        try {
            await api.post('/cart/add', null, {
                params: {
                    menuItemId: item.id,
                    quantity: 1
                }
            });

            setAddedItemIds(prev => ({
                ...prev,
                [item.id]: true
            }));

            setTimeout(() => {
                setAddedItemIds(prev => ({
                    ...prev,
                    [item.id]: false
                }));
            }, 2000);

        } catch (err) {
            console.error('Error adding item to cart:', err);

            // Show error message if different restaurant items added
            if (err.response && err.response.status === 400) {
                setCartError(err.response.data || 'Cannot add items from different restaurants to the same cart.');
            } else {
                setCartError('Failed to add item to cart. Please try again.');
            }
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div>
            <div className="container-fluid dashboard-header">
                <Header />
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
                                    <button className="btn btn-orange border-0" style={{ height: '50px', width: '60px' }}>
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
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="row">
                        <div className="col-lg-2 col-md-3 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                <h5 className="mb-3"><FontAwesomeIcon icon={faFilter} className="mr-2 me-1" />Sort By</h5>
                                <div className="ml-2 list-group">
                                    {[
                                        { key: 'bestMatch', icon: faThumbsUp, label: 'Best Match' },
                                        { key: 'alphabetical', icon: faFont, label: 'Alphabetical' },
                                        { key: 'rating', icon: faStar, label: 'Rating' },
                                        { key: 'favorites', icon: faHeart, label: 'My Favorites' }
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            className={`list-group-item list-group-item-action ${sortOption === opt.key ? 'active' : ''}`}
                                            onClick={() => setSortOption(opt.key)}
                                        >
                                            <FontAwesomeIcon icon={opt.icon} className="fa-fw me-1" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7 col-md-6 col-sm-12">
                            <div className="bg-white p-4 mb-4">
                                <h4 className="mb-4">Restaurants</h4>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-orange" role="status" />
                                        <p className="mt-2">Loading restaurants...</p>
                                    </div>
                                ) : filteredRestaurants.length > 0 ? (
                                    <div className="restaurant-list">
                                        {filteredRestaurants.map(restaurant => (
                                            <div className="restaurant-item mb-4" key={restaurant.restaurantId}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-2">
                                                                <img
                                                                    src={require("../assets/images/symbolshop.png")}
                                                                    alt={restaurant.name}
                                                                    className="img-fluid restaurant-image"
                                                                />
                                                            </div>
                                                            <div className="col-md-7">
                                                                <h5>{restaurant.name}</h5>
                                                                <div className="rating mb-2">
                                                                    {[1, 2, 3, 4, 5].map((star) => {
                                                                        const rating = restaurant.rating || 0;
                                                                        const fillPercentage = Math.max(0, Math.min(100, (rating - star + 1) * 100));

                                                                        return (
                                                                            <div
                                                                                key={star}
                                                                                className="star-container"
                                                                                style={{
                                                                                    display: 'inline-block',
                                                                                    position: 'relative',
                                                                                    width: '1em',
                                                                                    height: '1em',
                                                                                    marginRight: '2px'
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon icon={faStar} className="text-muted" />
                                                                                <div
                                                                                    className="star-fill"
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        top: 0,
                                                                                        left: 0,
                                                                                        width: `${fillPercentage}%`,
                                                                                        overflow: 'hidden',
                                                                                        whiteSpace: 'nowrap'
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faStar} className="text-orange" />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    <span className="ml-2 small text-muted">
                                                                        ({restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'})
                                                                    </span>
                                                                </div>
                                                                <p><small>Type: {restaurant.cuisineType}</small></p>
                                                                <p><small>Open: {restaurant.open ? 'Yes' : 'No'}</small></p>
                                                            </div>
                                                            <div className="col-md-3 text-right">
                                                                <button
                                                                    onClick={() => handleViewRestaurant(restaurant)}
                                                                    className="btn btn-orange btn-sm d-flex justify-content-between align-items-center w-100"
                                                                    style={{ padding: '0.5rem 1rem' }}
                                                                >
                                                                    <span>View Menus</span>
                                                                    <FontAwesomeIcon icon={faChevronDown} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <h5>No restaurants found</h5>
                                        <p>Try changing your search or filter criteria</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-3 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                <h5 className="mb-3"><FontAwesomeIcon icon={faFilter} className="mr-2 me-1" />Categories</h5>
                                <div className="category-list">
                                    {categories.map(category => (
                                        <div
                                            key={category}
                                            className={`category-item ${selectedCategories.includes(category) ? 'selected' : ''}`}
                                            onClick={() => handleCategoryToggle(category)}
                                        >
                                            {category}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Modal */}
            {showModal && selectedRestaurant && (
                <div className="menu-modal-overlay">
                    <div className="menu-modal">
                        <div className="menu-modal-header">
                            <h4>{selectedRestaurant.name} - Menu</h4>
                            <button className="btn-close " onClick={handleCloseModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        {cartError && (
                            <div className="alert alert-danger mx-3 mt-3">
                                {cartError}
                            </div>
                        )}
                        <div className="menu-modal-body">
                            {loadingMenu ? (
                                <div className="text-center py-3">
                                    <div className="spinner-border spinner-border-sm text-orange" role="status" />
                                    <p className="mt-2 small">Loading menu items...</p>
                                </div>
                            ) : (menuItems[selectedRestaurant.restaurantId]?.length > 0 ? (
                                <div className="row">
                                    {menuItems[selectedRestaurant.restaurantId].map(item => (
                                        <div className="menu-item mb-3" key={item.id}
                                            style={!selectedRestaurant.open ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                                        >
                                            <div className="d-flex justify-content-between align-items-center w-100">
                                                {/* Sol kısım: yemek bilgileri */}
                                                <div>
                                                    <h6 className="mb-1">{item.name}</h6>
                                                    <p className="mb-1 small text-muted">{item.description}</p>
                                                    <span className="text-orange font-weight-bold">{item.price.toFixed(2)} TL</span>
                                                </div>

                                                {/* Sağ kısım: buton */}
                                                <div>
                                                    <button
                                                        className="btn btn-outline-orange add-to-cart-btn"
                                                        onClick={() => handleAddToCart(item, selectedRestaurant.restaurantId)}
                                                        disabled={addingToCart || !selectedRestaurant.open}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                    {addedItemIds[item.id] && (
                                                        <div className="item-added-notification">
                                                            Added to Cart!
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    ))}
                                </div>

                            ) : (
                                <p className="text-center text-muted">No menu items available</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CustomerDashboard;