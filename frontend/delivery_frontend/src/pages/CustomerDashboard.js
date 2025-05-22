import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faStar, faFilter, faSortAmountDown, faFont,
    faThumbsUp, faChevronDown, faChevronUp, faHeart as faHeartSolid,
    faPlus, faShoppingCart, faTimes, faSort, faExclamationTriangle,
    faComments
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReviewsModal from '../components/ReviewsModal';
import api from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/dashboard.css';
import ComplaintModal from '../components/ComplaintModal';

// Import restaurant images
import image1 from '../assets/images/exampleRestaurants/image1.png';
import image2 from '../assets/images/exampleRestaurants/image2.png';
import image3 from '../assets/images/exampleRestaurants/image3.png';
import image4 from '../assets/images/exampleRestaurants/image4.png';
import image5 from '../assets/images/exampleRestaurants/image5.png';
import image6 from '../assets/images/exampleRestaurants/image6.png';
import image7 from '../assets/images/exampleRestaurants/image7.jpg';
import image8 from '../assets/images/exampleRestaurants/image8.jpg';
import image9 from '../assets/images/exampleRestaurants/image9.jpg';
import image10 from '../assets/images/exampleRestaurants/image10.jpg';
import image11 from '../assets/images/exampleRestaurants/image11.jpg';
import image12 from '../assets/images/exampleRestaurants/image12.jpg';
import image13 from '../assets/images/exampleRestaurants/image13.jpg';
import image14 from '../assets/images/exampleRestaurants/image14.jpg';
import image15 from '../assets/images/exampleRestaurants/image15.jpg';
import image16 from '../assets/images/exampleRestaurants/image16.jpg';
import image17 from '../assets/images/exampleRestaurants/image17.jpg';
import image18 from '../assets/images/exampleRestaurants/image18.jpg';
import image19 from '../assets/images/exampleRestaurants/image19.jpg';
import image20 from '../assets/images/exampleRestaurants/image20.jpg';

// Import restaurant images
import image1 from '../assets/images/exampleRestaurants/image1.png';
import image2 from '../assets/images/exampleRestaurants/image2.png';
import image3 from '../assets/images/exampleRestaurants/image3.png';
import image4 from '../assets/images/exampleRestaurants/image4.png';
import image5 from '../assets/images/exampleRestaurants/image5.png';
import image6 from '../assets/images/exampleRestaurants/image6.png';
import image7 from '../assets/images/exampleRestaurants/image7.jpg';
import image8 from '../assets/images/exampleRestaurants/image8.jpg';
import image9 from '../assets/images/exampleRestaurants/image9.jpg';
import image10 from '../assets/images/exampleRestaurants/image10.jpg';
import image11 from '../assets/images/exampleRestaurants/image11.jpg';
import image12 from '../assets/images/exampleRestaurants/image12.jpg';
import image13 from '../assets/images/exampleRestaurants/image13.jpg';
import image14 from '../assets/images/exampleRestaurants/image14.jpg';
import image15 from '../assets/images/exampleRestaurants/image15.jpg';
import image16 from '../assets/images/exampleRestaurants/image16.jpg';
import image17 from '../assets/images/exampleRestaurants/image17.jpg';
import image18 from '../assets/images/exampleRestaurants/image18.jpg';
import image19 from '../assets/images/exampleRestaurants/image19.jpg';
import image20 from '../assets/images/exampleRestaurants/image20.jpg';

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
    const [addingToFavorite, setAddingToFavorite] = useState(false);
    const [accountStatus, setAccountStatus] = useState('ACTIVE');
    const [restaurantImages, setRestaurantImages] = useState({});
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedRestaurantForReviews, setSelectedRestaurantForReviews] = useState(null);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    // Array of restaurant images
    const restaurantImageArray = [
        image1, image2, image3, image4, image5, image6, image7, image8, image9, image10,
        image11, image12, image13, image14, image15, image16, image17, image18, image19, image20
    ];

    // Function to get a random image for a restaurant
    const getRandomImage = (restaurantId) => {
        // If this restaurant already has an assigned image, return it
        if (restaurantImages[restaurantId]) {
            return restaurantImages[restaurantId];
        }

        // Otherwise, assign a random image and save it
        const randomIndex = Math.floor(Math.random() * restaurantImageArray.length);
        const selectedImage = restaurantImageArray[randomIndex];

        setRestaurantImages(prev => ({
            ...prev,
            [restaurantId]: selectedImage
        }));

        return selectedImage;
    };

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
    const fetchUserProfile = async () => {
        try {
            if (!token) return;

            const response = await api.get('/profile');

            if (response.data) {
                setAccountStatus(response.data.accountStatus || 'ACTIVE');

                if (response.data.accountStatus === 'SUSPENDED') {
                    toast.warning('Your account has been suspended. You can browse but cannot place orders.');
                }
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };


    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Kullanıcı profilini al
        fetchUserProfile();

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
                // Extract just the restaurant IDs from the response
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

        // Sort By: My Favorites - Sadece favori restoranları göster
        if (sortOption === 'favorites') {
            results = results.filter(restaurant =>
                favoriteRestaurants.includes(restaurant.restaurantId)
            );
        } else {
            // Diğer sıralama seçenekleri
            switch (sortOption) {
                case 'alphabetical':
                    results.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'rating':
                    results.sort((a, b) => b.rating - a.rating);
                    break;
                case 'bestMatch':
                default:
                    break;
            }
        }

        // Always sort closed restaurants to appear at the bottom
        results.sort((a, b) => {
            // If one is open and the other is closed, prioritize the open one
            if (a.open && !b.open) return -1;
            if (!a.open && b.open) return 1;
            return 0;
        });

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

        // Askıya alınmış kullanıcılar sipariş veremez
        if (accountStatus === 'SUSPENDED' || accountStatus === 'BANNED') {
            toast.error(`Your account has been ${accountStatus.toLowerCase()}. You cannot add items to your cart.`);
            return;
        }

        const selectedRest = restaurants.find(r => r.restaurantId === restaurantId);
        if (!selectedRest?.open) {
            toast.warning('This restaurant is currently closed. You cannot add items to your cart.');
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
            const errorMessage = err.response?.data || 'Failed to add item to cart. Please try again.';
            setCartError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleToggleFavorite = async (restaurantId, event) => {
        // Prevent the click from propagating to parent elements
        event.stopPropagation();

        if (addingToFavorite) return;

        setAddingToFavorite(true);

        try {
            const isFavorite = favoriteRestaurants.includes(restaurantId);

            if (isFavorite) {
                // Remove from favorites
                await api.delete('/profile/favorites/remove', {
                    params: { restaurantId }
                });

                // Update local state
                setFavoriteRestaurants(prev => prev.filter(id => id !== restaurantId));
                toast.success('Removed from favorites');
            } else {
                // Add to favorites
                await api.post('/profile/favorites/add', null, {
                    params: { restaurantId }
                });

                // Update local state
                setFavoriteRestaurants(prev => [...prev, restaurantId]);
                toast.success('Added to favorites');
            }
        } catch (err) {
            console.error('Error toggling favorite restaurant:', err);
            setError('Failed to update favorites. Please try again.');
            toast.error('Failed to update favorites');
        } finally {
            setAddingToFavorite(false);
        }
    };

    const handleViewReviews = (restaurant, event) => {
        event.stopPropagation();
        setSelectedRestaurantForReviews(restaurant);
        setShowReviewsModal(true);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container-fluid dashboard-header">
                <Header />
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

            <div className="flex-grow-1 d-flex flex-column" style={{ background: "#EBEDF3", minHeight: "70vh" }}>
                <div className="container-fluid py-4 flex-grow-1">
                    <div className="container">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {accountStatus === 'SUSPENDED' && (
                            <div className="alert alert-warning" role="alert">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                <strong>Your account has been suspended!</strong> You can browse restaurants but cannot place orders.
                                Please contact support for assistance.
                            </div>
                        )}

                        <div className="row">
                            <div className="col-lg-2 col-md-3 col-sm-12 mb-4">
                                <div className="bg-white p-4 dashboard-sidebar" style={{ minHeight: "250px" }}>
                                    <h5 className="mb-3"><FontAwesomeIcon icon={faSort} className="mr-2 me-2" />Sort By</h5>
                                    <div className="ml-2 list-group">
                                        {[
                                            { key: 'bestMatch', icon: faThumbsUp, label: 'Best Match' },
                                            { key: 'alphabetical', icon: faFont, label: 'Alphabetical' },
                                            { key: 'rating', icon: faStar, label: 'Rating' },
                                            { key: 'favorites', icon: faHeartSolid, label: 'My Favorites' }
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
                                <div className="bg-white p-4 mb-4" style={{ minHeight: "250px" }}>
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
                                                    <div className={`card shadow-sm restaurant-card ${!restaurant.open ? 'closed-restaurant' : ''}`}>
                                                        <div className="row g-0 align-items-center" style={!restaurant.open ? { opacity: '0.8', filter: 'blur(0.5px)' } : {}}>
                                                            {/* Image */}
                                                            <div className="col-md-3 text-center p-2">
                                                                <img
                                                                    src={getRandomImage(restaurant.restaurantId)}
                                                                    alt={restaurant.name}
                                                                    className="img-fluid rounded restaurant-image"
                                                                />
                                                            </div>

                                                            {/* Info */}
                                                            <div className="col-md-6 p-3">
                                                                <h5 className="card-title mb-2 text-nowrap text-truncate">
                                                                    {restaurant.name}
                                                                </h5>

                                                                <div className="rating mb-2">
                                                                    {[1, 2, 3, 4, 5].map((star) => {
                                                                        const rating = restaurant.rating || 0;
                                                                        const fillPercentage = Math.max(0, Math.min(100, (rating - star + 1) * 100));

                                                                        return (
                                                                            <div key={star} className="star-container d-inline-block position-relative" style={{ width: '1em', height: '1em', marginRight: '3px' }}>
                                                                                <FontAwesomeIcon icon={faStar} className="text-muted" />
                                                                                <div className="star-fill position-absolute top-0 start-0" style={{ width: `${fillPercentage}%`, overflow: 'hidden' }}>
                                                                                    <FontAwesomeIcon icon={faStar} className="text-warning" />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    <small className="text-muted ms-2">({restaurant.rating ? restaurant.rating.toFixed(1) : "0.0"})</small>
                                                                </div>

                                                                <p className="mb-1 text-muted small">Type: {restaurant.cuisineType || "N/A"}</p>
                                                                <p className="mb-0 text-muted small">
                                                                    Status: {restaurant.open ?
                                                                        <span className="text-success">Open</span> :
                                                                        <span className="text-danger">Closed</span>
                                                                    }
                                                                    {restaurant.accountStatus === 'SUSPENDED' &&
                                                                        <span className="text-warning"> (Suspended)</span>
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Button Column - Update the buttons section */}
                                                            <div className="col-md-3 text-end p-3 d-flex flex-column align-items-end position-relative">
                                                                <div className="d-flex gap-2 position-absolute" style={{ top: '0.75rem', right: '1rem' }}>
                                                                    <button
                                                                        className="btn btn-link p-0"
                                                                        onClick={(e) => handleViewReviews(restaurant, e)}
                                                                        title="View Reviews"
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={faComments}
                                                                            className="text-secondary"
                                                                            size="lg"
                                                                        />
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-link p-0"
                                                                        onClick={(e) => handleToggleFavorite(restaurant.restaurantId, e)}
                                                                        title={favoriteRestaurants.includes(restaurant.restaurantId) ? "Remove from favorites" : "Add to favorites"}
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={favoriteRestaurants.includes(restaurant.restaurantId) ? faHeartSolid : faHeartRegular}
                                                                            className={favoriteRestaurants.includes(restaurant.restaurantId) ? "text-danger" : "text-secondary"}
                                                                            size="lg"
                                                                        />
                                                                    </button>
                                                                </div>

                                                                {/* View Menus Button - Add margin-top */}
                                                                <button
                                                                    className="btn btn-orange w-100 mt-5"
                                                                    onClick={() => handleViewRestaurant(restaurant)}
                                                                    disabled={!restaurant.open}
                                                                >
                                                                    View Menus <FontAwesomeIcon icon={faChevronDown} className="ms-2" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {!restaurant.open && (
                                                            <div className="closed-overlay">
                                                                <span className="closed-text">Closed</span>
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
                                <div className="bg-white p-4 dashboard-sidebar" >
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

                                {/* New Complaints Section */}
                                <div className="bg-white p-4 dashboard-sidebar mt-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 me-2" />
                                            Complaints
                                        </h5>
                                        <button
                                            className="btn btn-orange rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px', padding: '0' }}
                                            onClick={() => setShowComplaintModal(true)}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                    <p className="text-muted small mt-2 mb-0" style={{ textAlign: 'justify' }}>
                                        Share your feedback, suggestions, or report issues to help us improve our service.
                                    </p>
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
                        <div className="menu-modal-header d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center w-100">
                                <img
                                    src={getRandomImage(selectedRestaurant.restaurantId)}
                                    alt={selectedRestaurant.name}
                                    className="rounded me-3"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <h4 className="mb-0 text-truncate" style={{ maxWidth: '85%' }}>
                                    {selectedRestaurant.name}
                                </h4>
                            </div>
                            <button 
                                className="btn-close" 
                                onClick={handleCloseModal}
                                style={{
                                    backgroundColor: '#eb6825',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '0.3rem',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    opacity: 1,
                                    backgroundImage: 'none'
                                }}
                            >
                                <span style={{ color: 'white', lineHeight: 1 }}>×</span>
                            </button>
                        </div>
                        {cartError && (
                            <div className="alert alert-danger mx-3 mt-3">
                                {cartError}
                            </div>
                        )}
                        <div className="menu-modal-body reviews-container" style={{ height: 'calc(80vh - 120px)' }}>
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
                                                <div>
                                                    <h6 className="mb-1">{item.name}</h6>
                                                    <p className="mb-1 small text-muted">{item.description}</p>
                                                    <span className="text-orange font-weight-bold">{item.price.toFixed(2)} TL</span>
                                                </div>
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

            {/* Add the ReviewsModal */}
            <ReviewsModal
                show={showReviewsModal}
                onClose={() => {
                    setShowReviewsModal(false);
                    setSelectedRestaurantForReviews(null);
                }}
                restaurantId={selectedRestaurantForReviews?.restaurantId}
                restaurantName={selectedRestaurantForReviews?.name}
            />

            {/* Add ComplaintModal */}
            <ComplaintModal
                show={showComplaintModal}
                onClose={() => setShowComplaintModal(false)}
            />

            <Footer />
        </div>
    );
};

export default CustomerDashboard;