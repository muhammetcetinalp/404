import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faStar, faFilter, faSortAmountDown, faFont,
    faThumbsUp, faChevronDown, faChevronUp, faHeart, faPlus, faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';
import { AccountStatusBanner, checkAccountStatus } from '../components/AccountStatusBanner';

const CustomerDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('bestMatch');
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [expandedRestaurantId, setExpandedRestaurantId] = useState(null);
    const [menuItems, setMenuItems] = useState({});
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedItemIds, setAddedItemIds] = useState({});
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

        // Kullanıcı durumunu kontrol et
        if (!checkAccountStatus()) {
            return; // Eğer BANNED ise, checkAccountStatus fonksiyonu yönlendirme yapacaktır
        }

        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/public/search-restaurants');
                console.log('API Response:', response.data); // API yanıtını logla
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

    const handleViewRestaurant = async (restaurantId) => {
        if (expandedRestaurantId === restaurantId) {
            setExpandedRestaurantId(null);
            return;
        }

        setExpandedRestaurantId(restaurantId);
        setLoadingMenu(true);

        try {
            const response = await api.get(`/restaurants/${restaurantId}/menu`);
            setMenuItems(prev => ({
                ...prev,
                [restaurantId]: response.data
            }));
        } catch (err) {
            console.error('Error fetching menu items:', err);
        } finally {
            setLoadingMenu(false);
        }
    };

    const handleAddToCart = async (item, restaurantId) => {
        if (addingToCart) return;

        const selectedRestaurant = restaurants.find(r => r.restaurantId === restaurantId);
        if (!selectedRestaurant?.open) {
            alert('This restaurant is currently closed. You cannot add items to your cart.');
            return;
        }

        setAddingToCart(true);

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
        } finally {
            setAddingToCart(false);
        }
    };



    return (
        <div>
            <div className="container-fluid dashboard-header">
                <Header />

                {/* Account Status Banner - Suspended kullanıcılar için uyarı */}
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
                                    <button className="btn btn-warning border-0" style={{ height: '50px', width: '60px' }}>
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
                                <h5 className="mb-3"><FontAwesomeIcon icon={faFilter} className="mr-2" />Sort By</h5>
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
                                        <div className="spinner-border text-warning" role="status" />
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
                                                                                    <FontAwesomeIcon icon={faStar} className="text-warning" />
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
                                                                    onClick={() => handleViewRestaurant(restaurant.restaurantId)}
                                                                    className="btn btn-warning btn-sm"
                                                                >
                                                                    {expandedRestaurantId === restaurant.restaurantId
                                                                        ? <>Hide Menu <FontAwesomeIcon icon={faChevronUp} /></>
                                                                        : <>View Menus <FontAwesomeIcon icon={faChevronDown} /></>}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedRestaurantId === restaurant.restaurantId && (
                                                        <div className="card-footer p-3">
                                                            <h6>Menu Items</h6>
                                                            {loadingMenu ? (
                                                                <div className="text-center py-3">
                                                                    <div className="spinner-border spinner-border-sm text-warning" role="status" />
                                                                    <p className="mt-2 small">Loading menu items...</p>
                                                                </div>
                                                            ) : (menuItems[restaurant.restaurantId]?.length > 0 ? (
                                                                <div className="row">
                                                                    {menuItems[restaurant.restaurantId].map(item => (
                                                                        <div className="col-md-6 mb-3" key={item.id}>
                                                                            <div className="menu-item p-3 border rounded position-relative"
                                                                                style={!restaurant.open ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                                                                            >
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    <div>
                                                                                        <h6>{item.name}</h6>
                                                                                        <p className="mb-1 small text-muted">{item.description}</p>
                                                                                        <span className="text-warning font-weight-bold">{item.price.toFixed(2)} TL</span>
                                                                                    </div>
                                                                                    <button
                                                                                        className="btn btn-outline-warning add-to-cart-btn"
                                                                                        onClick={() => handleAddToCart(item, restaurant.restaurantId)}
                                                                                        disabled={addingToCart || !restaurant.open}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                                    </button>
                                                                                </div>

                                                                                {/* Item-specific success notification */}
                                                                                {addedItemIds[item.id] && (
                                                                                    <div className="item-added-notification">
                                                                                        Added to Cart!
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-center text-muted">No menu items available</p>
                                                            ))}
                                                        </div>
                                                    )}
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
                                <h5 className="mb-3"><FontAwesomeIcon icon={faFilter} className="mr-2" />Categories</h5>
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

            <Footer />
        </div>
    );
};

export default CustomerDashboard;