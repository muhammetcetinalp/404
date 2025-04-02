import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStar, faFilter, faSortAmountDown, faFont, faThumbsUp, faChevronDown, faChevronUp, faHeart } from '@fortawesome/free-solid-svg-icons'; import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/dashboard.css';

import image1 from '../assets/images/exampleRestaurants/image1.png';
import image2 from '../assets/images/exampleRestaurants/image2.png';
import image3 from '../assets/images/exampleRestaurants/image3.png';
import image4 from '../assets/images/exampleRestaurants/image4.png';
import image5 from '../assets/images/exampleRestaurants/image5.png';
import image6 from '../assets/images/exampleRestaurants/image6.png';


const CustomerDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('bestMatch');
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [expandedRestaurantId, setExpandedRestaurantId] = useState(null); // Yeni: menüsü açık olan restoran ID'si
    const [menuItems, setMenuItems] = useState({}); // Yeni: restoranların menü öğelerini depolamak için
    const [loadingMenu, setLoadingMenu] = useState(false); // Yeni: menü yüklenirken yükleme durumu
    const navigate = useNavigate();

    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    // Kategorileri tanımlama
    const categories = [
        'Italian',
        'Chinese',
        'Mexican',
        'Indian',
        'Japanese',
        'American',
        'Turkish'
    ];

    // Kategori seçim işlevi
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

        // API'den veri çekme yerine örnek veri kullanıyoruz ilk adımda
        const exampleRestaurants = [
            {
                id: 1,
                name: "Apple Jabba",
                imageUrl: image1,
                rating: 4,
                reviewCount: 128,
                typeOfFood: ["Italian", "Pizza"],
                deliveryTime: "25-35 min"
            },
            {
                id: 2,
                name: "BB.Q Chicken",
                imageUrl: image2,
                rating: 5,
                reviewCount: 256,
                typeOfFood: ["Korean", "Fried Chicken"],
                deliveryTime: "30-45 min"
            },
            {
                id: 3,
                name: "Beef Rosati",
                imageUrl: image3,
                rating: 4,
                reviewCount: 87,
                typeOfFood: ["American", "Steak"],
                deliveryTime: "20-30 min"
            },
            {
                id: 4,
                name: "Cheese Burger",
                imageUrl: image4,
                rating: 3,
                reviewCount: 42,
                typeOfFood: ["American", "Fast Food"],
                deliveryTime: "15-25 min"
            },
            {
                id: 5,
                name: "Cold Coffee",
                imageUrl: image5,
                rating: 4,
                reviewCount: 156,
                typeOfFood: ["Cafe", "Desserts"],
                deliveryTime: "10-20 min"
            },
            {
                id: 6,
                name: "Chicken Rosati",
                imageUrl: image6,
                rating: 4,
                reviewCount: 94,
                typeOfFood: ["Italian", "Chicken"],
                deliveryTime: "25-40 min"
            }
        ];

        setRestaurants(exampleRestaurants);
        setFilteredRestaurants(exampleRestaurants);
        setLoading(false);

        // Gerçek API isteği yapmak istediğimizde kullanacağımız:
        /*
        const fetchRestaurants = async () => {
          try {
            const response = await api.get('/restaurants');
            setRestaurants(response.data);
            setFilteredRestaurants(response.data);
          } catch (err) {
            console.error('Error:', err);
          }
        };
        fetchRestaurants();
        */
    }, [token, navigate]);

    const exampleFavorites = [1, 3, 5]; // Örnek olarak ID'leri 1, 3 ve 5 olan restoranlar favori

    useEffect(() => {
        // Favori restoranları yükle (gerçek uygulamada API çağrısı yapılacak)
        setFavoriteRestaurants(exampleFavorites);
    }, []);


    useEffect(() => {
        let results = restaurants;

        // Arama filtresi
        if (searchTerm) {
            results = results.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.typeOfFood?.some(food =>
                    food.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Kategori filtresi
        if (selectedCategories.length > 0) {
            results = results.filter(restaurant =>
                restaurant.typeOfFood?.some(food =>
                    selectedCategories.includes(food)
                )
            );
        }

        // Sıralama işlemi
        switch (sortOption) {
            case 'alphabetical':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            case 'favorites':
                results.sort((a, b) => {
                    const aIsFavorite = favoriteRestaurants.includes(a.id);
                    const bIsFavorite = favoriteRestaurants.includes(b.id);
                    return bIsFavorite - aIsFavorite; // Favoriler önce gelecek şekilde sırala
                });
                break;
            case 'bestMatch':
            default:
                break;
        }

        setFilteredRestaurants(results);
    }, [searchTerm, sortOption, selectedCategories, restaurants]);

    // Örnek menüler - normalde bunları API'den alacaksınız
    const exampleMenus = {
        1: [
            { id: 101, name: "Margherita Pizza", price: 12.99, description: "Classic tomato and mozzarella pizza", category: "Pizza" },
            { id: 102, name: "Pepperoni Pizza", price: 14.99, description: "Pizza with pepperoni, tomato sauce and mozzarella", category: "Pizza" },
            { id: 103, name: "Pasta Carbonara", price: 13.50, description: "Creamy pasta with bacon and egg", category: "Pasta" }
        ],
        2: [
            { id: 201, name: "Original Fried Chicken", price: 15.99, description: "Crispy fried chicken with secret spices", category: "Chicken" },
            { id: 202, name: "Spicy Chicken Wings", price: 12.99, description: "Spicy wings with Korean sauce", category: "Chicken" },
            { id: 203, name: "Kimchi Fried Rice", price: 10.50, description: "Fried rice with kimchi and vegetables", category: "Rice" }
        ],
        3: [
            { id: 301, name: "T-Bone Steak", price: 28.99, description: "Grilled T-bone steak with vegetables", category: "Steak" },
            { id: 302, name: "Ribeye Steak", price: 26.50, description: "Juicy ribeye with mashed potatoes", category: "Steak" },
            { id: 303, name: "Beef Burger", price: 16.99, description: "Beef burger with cheese and fries", category: "Burger" }
        ],
        4: [
            { id: 401, name: "Classic Cheeseburger", price: 9.99, description: "Beef patty with cheese and veggies", category: "Burger" },
            { id: 402, name: "Double Burger", price: 12.99, description: "Two beef patties with cheese", category: "Burger" },
            { id: 403, name: "Chicken Burger", price: 8.99, description: "Grilled chicken burger with lettuce", category: "Burger" }
        ],
        5: [
            { id: 501, name: "Iced Latte", price: 4.50, description: "Cold coffee with milk", category: "Coffee" },
            { id: 502, name: "Chocolate Cake", price: 5.99, description: "Rich chocolate cake slice", category: "Dessert" },
            { id: 503, name: "Tiramisu", price: 6.50, description: "Classic Italian coffee dessert", category: "Dessert" }
        ],
        6: [
            { id: 601, name: "Grilled Chicken", price: 15.99, description: "Marinated grilled chicken with herbs", category: "Chicken" },
            { id: 602, name: "Chicken Pasta", price: 14.50, description: "Pasta with chicken and cream sauce", category: "Pasta" },
            { id: 603, name: "Chicken Salad", price: 11.99, description: "Fresh salad with grilled chicken", category: "Salad" }
        ]
    };

    // View Menus butonuna tıklama işlevi (değiştirildi)
    const handleViewRestaurant = (restaurantId) => {
        if (expandedRestaurantId === restaurantId) {
            // Eğer zaten bu restoran açıksa, kapatır
            setExpandedRestaurantId(null);
        } else {
            // Yeni bir restoranı açar ve menüsünü yükler
            setExpandedRestaurantId(restaurantId);
            setLoadingMenu(true);

            // Gerçek bir uygulamada, API'den menü öğelerini alacaksınız
            // Örnek: const response = await api.get(`/restaurants/${restaurantId}/menu-items`);

            // Şimdilik örnek verileri kullanıyoruz
            setTimeout(() => {
                setMenuItems({
                    ...menuItems,
                    [restaurantId]: exampleMenus[restaurantId] || []
                });
                setLoadingMenu(false);
            }, 500); // 500ms gecikme ile örnek API çağrısı simülasyonu
        }
    };

    return (
        <div>
            {/* Header ve diğer bölümler aynı... */}
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
                        {/* Sol kenar çubuğu - aynı... */}
                        <div className="col-lg-2 col-md-3 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Sort By
                                </h5>

                                <div className="ml-2">
                                    <div className="list-group">
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'bestMatch' ? 'active' : ''}`}
                                            onClick={() => setSortOption('bestMatch')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faThumbsUp} />
                                            </span>
                                            <span className="ml-2">Best Match</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'alphabetical' ? 'active' : ''}`}
                                            onClick={() => setSortOption('alphabetical')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faFont} />
                                            </span>
                                            <span className="ml-2">Alphabetical</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'rating' ? 'active' : ''}`}
                                            onClick={() => setSortOption('rating')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faStar} />
                                            </span>
                                            <span className="ml-2">Rating</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'favorites' ? 'active' : ''}`}
                                            onClick={() => setSortOption('favorites')}
                                        >
                                            <span className="icon-container" style={{ width: '25px', display: 'inline-block' }}>
                                                <FontAwesomeIcon icon={faHeart} /> {/* FontAwesome'den kalp ikonu */}
                                            </span>
                                            <span className="ml-2">My Favorites</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ana içerik - Restoranlar - değiştirildi */}
                        <div className="col-lg-7 col-md-6 col-sm-12">
                            <div className="bg-white p-4 mb-4">
                                <h4 className="mb-4">Restaurants</h4>

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
                                                <div className="card">
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
                                                                            className={i < restaurant.rating ? 'text-warning' : 'text-muted'}
                                                                        />
                                                                    ))}
                                                                    <span className="ml-2">({restaurant.reviewCount})</span>
                                                                </div>
                                                                <p className="card-text mb-1">
                                                                    <small>Type of Foods: {restaurant.typeOfFood?.join(', ')}</small>
                                                                </p>
                                                                <p className="card-text">
                                                                    <small>Delivery Time: {restaurant.deliveryTime}</small>
                                                                </p>
                                                            </div>
                                                            <div className="col-md-3 text-right">
                                                                <button
                                                                    onClick={() => handleViewRestaurant(restaurant.id)}
                                                                    className="btn btn-warning btn-sm"
                                                                >
                                                                    {expandedRestaurantId === restaurant.id ? (
                                                                        <>Hide Menu <FontAwesomeIcon icon={faChevronUp} /></>
                                                                    ) : (
                                                                        <>View Menus <FontAwesomeIcon icon={faChevronDown} /></>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Menü Gösterimi - Yeni Eklendi */}
                                                    {expandedRestaurantId === restaurant.id && (
                                                        <div className="card-footer menu-section p-3">
                                                            <h6 className="mb-3">Menu Items</h6>

                                                            {loadingMenu ? (
                                                                <div className="text-center py-3">
                                                                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                                                                        <span className="sr-only">Loading menu...</span>
                                                                    </div>
                                                                    <p className="mt-2 small">Loading menu items...</p>
                                                                </div>
                                                            ) : menuItems[restaurant.id] && menuItems[restaurant.id].length > 0 ? (
                                                                <div className="row">
                                                                    {menuItems[restaurant.id].map(item => (
                                                                        <div className="col-md-6 mb-3" key={item.id}>
                                                                            <div className="menu-item p-3 border rounded">
                                                                                <div className="d-flex justify-content-between">
                                                                                    <h6 className="mb-1">{item.name}</h6>
                                                                                    <span className="text-warning font-weight-bold">${item.price.toFixed(2)}</span>
                                                                                </div>
                                                                                <p className="mb-1 small text-muted">{item.description}</p>
                                                                                <span className="badge badge-light">{item.category}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-center text-muted">No menu items available</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <FontAwesomeIcon icon="utensils" size="3x" className="mb-3 text-muted" />
                                        <h5>No restaurants found</h5>
                                        <p>Try changing your search or filter criteria</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sağ kenar çubuğu - kategoriler */}
                        <div className="col-lg-3 col-md-3 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Categories
                                </h5>

                                <div>
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
            </div>

            <Footer />
        </div>
    );
};

export default CustomerDashboard;