import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUtensils, faPlus, faEdit, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api';
import '../styles/restaurant-dashboard.css';
import '../styles/dashboard.css';

const RestaurantMenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('nameAsc');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editItemId, setEditItemId] = useState(null);

    // Form states
    const [newMenuItem, setNewMenuItem] = useState({
        name: '',
        description: '',
        price: '',
        category: 'main'
    });

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');

    // Category options for filtering
    const categoryOptions = [
        { value: 'all', label: 'All Items' },
        { value: 'appetizer', label: 'Appetizers' },
        { value: 'main', label: 'Main Courses' },
        { value: 'dessert', label: 'Desserts' },
        { value: 'beverage', label: 'Beverages' }
    ];

    // Example menu items
    const exampleMenuItems = [
        {
            id: 1,
            name: "Margherita Pizza",
            description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
            price: 12.99,
            category: "main",
            isAvailable: true,
            imageUrl: "",
            ratings: 4.7,
            numRatings: 145
        },
        {
            id: 2,
            name: "Pepperoni Pizza",
            description: "Pizza topped with pepperoni, mozzarella, and tomato sauce",
            price: 14.99,
            category: "main",
            isAvailable: true,
            imageUrl: "",
            ratings: 4.8,
            numRatings: 190
        },
        {
            id: 3,
            name: "Pasta Carbonara",
            description: "Spaghetti with creamy sauce, bacon, and parmesan cheese",
            price: 13.50,
            category: "main",
            isAvailable: true,
            imageUrl: "",
            ratings: 4.6,
            numRatings: 120
        },
        {
            id: 4,
            name: "Garlic Bread",
            description: "Crispy bread topped with garlic butter and herbs",
            price: 4.50,
            category: "appetizer",
            isAvailable: true,
            imageUrl: "",
            ratings: 4.5,
            numRatings: 85
        },
        {
            id: 5,
            name: "Tiramisu",
            description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
            price: 6.50,
            category: "dessert",
            isAvailable: true,
            imageUrl: "",
            ratings: 4.9,
            numRatings: 78
        },
        {
            id: 6,
            name: "Iced Latte",
            description: "Espresso with cold milk and ice",
            price: 4.50,
            category: "beverage",
            isAvailable: true,
            imageUrl: "",
            ratings: 4.4,
            numRatings: 65
        }
    ];

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Set example menu items (fetch from API in production)
        setMenuItems(exampleMenuItems);
        setFilteredMenuItems(exampleMenuItems);
        setLoading(false);

        // Use API call in production:
        /*
        const fetchMenuItems = async () => {
          try {
            setLoading(true);
            const response = await api.get(`/restaurants/${restaurantId}/menu-items`);
            setMenuItems(response.data);
            setFilteredMenuItems(response.data);
            setLoading(false);
          } catch (err) {
            console.error('Error:', err);
            setError('Failed to load menu items. Please try again later.');
            setLoading(false);
          }
        };
        fetchMenuItems();
        */
    }, [token, navigate, restaurantId]);

    useEffect(() => {
        let results = menuItems;

        // Apply search filter
        if (searchTerm) {
            results = results.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (filterCategory !== 'all') {
            results = results.filter(item => item.category === filterCategory);
        }

        // Apply sorting
        switch (sortOption) {
            case 'nameAsc':
                results = [...results].sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                results = [...results].sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'priceAsc':
                results = [...results].sort((a, b) => a.price - b.price);
                break;
            case 'priceDesc':
                results = [...results].sort((a, b) => b.price - a.price);
                break;
            case 'ratingDesc':
                results = [...results].sort((a, b) => b.ratings - a.ratings);
                break;
            default:
                break;
        }

        setFilteredMenuItems(results);
    }, [searchTerm, sortOption, filterCategory, menuItems]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMenuItem({
            ...newMenuItem,
            [name]: name === 'price' ? parseFloat(value) || '' : value
        });
    };

    const resetForm = () => {
        setNewMenuItem({
            name: '',
            description: '',
            price: '',
            category: 'main'
        });
        setShowAddForm(false);
        setEditItemId(null);
    };

    const handleAddMenuItem = (e) => {
        e.preventDefault();

        // Validate form
        if (!newMenuItem.name || !newMenuItem.description || !newMenuItem.price) {
            setError('Please fill all required fields');
            return;
        }

        // Create new menu item with ID
        const newItem = {
            ...newMenuItem,
            id: menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1,
            isAvailable: true,
            imageUrl: "",
            ratings: 0,
            numRatings: 0
        };

        // Add to menu items
        const updatedItems = [...menuItems, newItem];
        setMenuItems(updatedItems);

        // Reset form
        resetForm();
        setError('');

        // In production, use API call:
        /*
        const addMenuItem = async () => {
          try {
            const response = await api.post(`/restaurants/${restaurantId}/menu-items`, newMenuItem);
            setMenuItems([...menuItems, response.data]);
            resetForm();
            setError('');
          } catch (err) {
            console.error('Error adding menu item:', err);
            setError('Failed to add menu item. Please try again.');
          }
        };
        addMenuItem();
        */
    };

    const handleEditMenuItem = (id) => {
        const itemToEdit = menuItems.find(item => item.id === id);
        if (itemToEdit) {
            setNewMenuItem({
                name: itemToEdit.name,
                description: itemToEdit.description,
                price: itemToEdit.price,
                category: itemToEdit.category
            });
            setEditItemId(id);
            setShowAddForm(true);
            window.scrollTo(0, 0);
        }
    };

    const handleUpdateMenuItem = (e) => {
        e.preventDefault();

        // Validate form
        if (!newMenuItem.name || !newMenuItem.description || !newMenuItem.price) {
            setError('Please fill all required fields');
            return;
        }

        // Update menu item
        const updatedItems = menuItems.map(item =>
            item.id === editItemId ? { ...item, ...newMenuItem } : item
        );

        setMenuItems(updatedItems);
        resetForm();
        setError('');

        // In production, use API call:
        /*
        const updateMenuItem = async () => {
          try {
            await api.put(`/restaurants/${restaurantId}/menu-items/${editItemId}`, newMenuItem);
            const updatedItems = menuItems.map(item => 
              item.id === editItemId ? { ...item, ...newMenuItem } : item
            );
            setMenuItems(updatedItems);
            resetForm();
            setError('');
          } catch (err) {
            console.error('Error updating menu item:', err);
            setError('Failed to update menu item. Please try again.');
          }
        };
        updateMenuItem();
        */
    };

    const handleDeleteMenuItem = (id) => {
        // Confirm before deleting
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            const updatedItems = menuItems.filter(item => item.id !== id);
            setMenuItems(updatedItems);

            // In production, use API call:
            /*
            const deleteMenuItem = async () => {
              try {
                await api.delete(`/restaurants/${restaurantId}/menu-items/${id}`);
                const updatedItems = menuItems.filter(item => item.id !== id);
                setMenuItems(updatedItems);
              } catch (err) {
                console.error('Error deleting menu item:', err);
                setError('Failed to delete menu item. Please try again.');
              }
            };
            deleteMenuItem();
            */
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
                                        placeholder="Search menu items by name or description..."
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
                        {/* Left Sidebar */}
                        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
                            <div className="bg-white p-4 dashboard-sidebar">
                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Sort By
                                </h5>

                                <div className="ml-2 mb-4">
                                    <div className="list-group">
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'nameAsc' ? 'active' : ''}`}
                                            onClick={() => setSortOption('nameAsc')}
                                        >
                                            <span className="ml-2">Name (A-Z)</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'nameDesc' ? 'active' : ''}`}
                                            onClick={() => setSortOption('nameDesc')}
                                        >
                                            <span className="ml-2">Name (Z-A)</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'priceAsc' ? 'active' : ''}`}
                                            onClick={() => setSortOption('priceAsc')}
                                        >
                                            <span className="ml-2">Price (Low to High)</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'priceDesc' ? 'active' : ''}`}
                                            onClick={() => setSortOption('priceDesc')}
                                        >
                                            <span className="ml-2">Price (High to Low)</span>
                                        </button>
                                        <button
                                            className={`list-group-item list-group-item-action ${sortOption === 'ratingDesc' ? 'active' : ''}`}
                                            onClick={() => setSortOption('ratingDesc')}
                                        >
                                            <span className="ml-2">Highest Rated</span>
                                        </button>
                                    </div>
                                </div>

                                <h5 className="mb-3">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Filter By Category
                                </h5>

                                <div className="ml-2">
                                    <div className="list-group">
                                        {categoryOptions.map(option => (
                                            <button
                                                key={option.value}
                                                className={`list-group-item list-group-item-action ${filterCategory === option.value ? 'active' : ''}`}
                                                onClick={() => setFilterCategory(option.value)}
                                            >
                                                <span className="ml-2">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-lg-9 col-md-8 col-sm-12">
                            <div className="bg-white p-4 mb-4">
                                <div className="menu-header">
                                    <h4>Menu Management</h4>
                                    <button
                                        className="btn btn-warning d-inline-block"
                                        onClick={() => setShowAddForm(!showAddForm)}
                                        style={{ width: 'auto' }}
                                    >
                                        <FontAwesomeIcon icon={showAddForm ? faTimes : faPlus} className="me-2" />
                                        {showAddForm ? 'Cancel' : 'Add New Menu Item'}
                                    </button>
                                </div>

                                {/* Add/Edit Form */}
                                {showAddForm && (
                                    <div className="card mb-4">
                                        <div className="card-header bg-light">
                                            <h5 className="mb-0">{editItemId ? 'Edit Menu Item' : 'Add New Menu Item'}</h5>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={editItemId ? handleUpdateMenuItem : handleAddMenuItem}>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label htmlFor="name" className="form-label">Menu Item Name*</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="name"
                                                            name="name"
                                                            value={newMenuItem.name}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label htmlFor="price" className="form-label">Price ($)*</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="form-control"
                                                            id="price"
                                                            name="price"
                                                            value={newMenuItem.price}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label htmlFor="category" className="form-label">Category</label>
                                                        <select
                                                            className="form-select"
                                                            id="category"
                                                            name="category"
                                                            value={newMenuItem.category}
                                                            onChange={handleInputChange}
                                                        >
                                                            {categoryOptions.filter(cat => cat.value !== 'all').map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="description" className="form-label">Description*</label>
                                                    <textarea
                                                        className="form-control"
                                                        id="description"
                                                        name="description"
                                                        rows="3"
                                                        value={newMenuItem.description}
                                                        onChange={handleInputChange}
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="d-flex justify-content-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary me-2"
                                                        onClick={resetForm}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="btn btn-warning">
                                                        <FontAwesomeIcon icon={faSave} className="me-2" />
                                                        {editItemId ? 'Update Item' : 'Add Item'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-warning" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading menu items...</p>
                                    </div>
                                ) : filteredMenuItems.length > 0 ? (
                                    <div className="order-list">
                                        {filteredMenuItems.map(item => (
                                            <div className="order-item mb-4" key={item.id}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-8">
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <h5 className="card-title mb-0">{item.name}</h5>
                                                                    <span className={`badge ms-2 ${item.category === 'main' ? 'bg-primary' :
                                                                        item.category === 'appetizer' ? 'bg-info' :
                                                                            item.category === 'dessert' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-muted mb-2">{item.description}</p>
                                                                {item.ratings > 0 && (
                                                                    <p className="mb-0 small">
                                                                        <strong>Rating:</strong> {item.ratings.toFixed(1)}/5 ({item.numRatings} reviews)
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="col-md-4 text-md-end">
                                                                <h5 className="text-warning mb-3">${item.price.toFixed(2)}</h5>
                                                                <div className="btn-group" role="group">
                                                                    <button
                                                                        className="btn btn-outline-secondary"
                                                                        onClick={() => handleEditMenuItem(item.id)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-danger"
                                                                        onClick={() => handleDeleteMenuItem(item.id)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <FontAwesomeIcon icon={faUtensils} size="3x" className="mb-3 text-muted" />
                                        <h5>No menu items found</h5>
                                        <p>There are no menu items matching your current filters</p>
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

export default RestaurantMenuPage;