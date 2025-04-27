import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUtensils, faPlus, faEdit, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/restaurant-dashboard.css';
import '../styles/dashboard.css';

const RestaurantMenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('nameAsc');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editItemId, setEditItemId] = useState(null);

    // Form states
    const [newMenuItem, setNewMenuItem] = useState({
        name: '',
        description: '',
        price: '',
        available: true
    });

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

    // API request headers
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Fetch menu items function
    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            console.log("Fetching menu items for restaurant:", restaurantId);

            const response = await axios.get(
                `http://localhost:8080/api/restaurants/${restaurantId}/menu`,
                { headers }
            );

            console.log("Menu items fetched:", response.data);
            setMenuItems(response.data);
            setFilteredMenuItems(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching menu items:', err);
            setError('Failed to load menu items. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchMenuItems();
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
            default:
                break;
        }

        setFilteredMenuItems(results);
    }, [searchTerm, sortOption, menuItems]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMenuItem({
            ...newMenuItem,
            [name]: type === 'checkbox' ? checked :
                name === 'price' ? parseFloat(value) || '' : value
        });
    };

    const resetForm = () => {
        setNewMenuItem({
            name: '',
            description: '',
            price: '',
            available: true
        });
        setShowAddForm(false);
        setEditItemId(null);
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();

        // Validate form
        if (!newMenuItem.name || !newMenuItem.description || !newMenuItem.price) {
            setError('Please fill all required fields');
            return;
        }

        try {
            console.log("Adding menu item for restaurant:", restaurantId);
            console.log("Menu item data:", newMenuItem);

            const response = await axios.post(
                `http://localhost:8080/api/restaurants/${restaurantId}/menu`,
                {
                    name: newMenuItem.name,
                    description: newMenuItem.description,
                    price: newMenuItem.price,
                    available: newMenuItem.available
                },
                { headers }
            );

            console.log("Add menu item response:", response);

            // Refresh menu items
            await fetchMenuItems();

            resetForm();
            setError('');
        } catch (err) {
            console.error('Error adding menu item:', err);
            console.error('Error details:', err.response?.data);
            setError(`Failed to add menu item: ${err.response?.data || err.message}`);
        }
    };

    const handleEditMenuItem = (id) => {
        const itemToEdit = menuItems.find(item => item.id === id);
        if (itemToEdit) {
            setNewMenuItem({
                name: itemToEdit.name,
                description: itemToEdit.description,
                price: itemToEdit.price,
                available: itemToEdit.available !== undefined ? itemToEdit.available : true
            });
            setEditItemId(id);
            setShowAddForm(true);
            window.scrollTo(0, 0);
        }
    };

    const handleUpdateMenuItem = async (e) => {
        e.preventDefault();

        // Validate form
        if (!newMenuItem.name || !newMenuItem.description || !newMenuItem.price) {
            setError('Please fill all required fields');
            return;
        }

        try {
            console.log("Updating menu item:", editItemId);
            console.log("Updated data:", newMenuItem);

            await axios.put(
                `http://localhost:8080/api/restaurants/${restaurantId}/menu/${editItemId}`,
                {
                    name: newMenuItem.name,
                    description: newMenuItem.description,
                    price: newMenuItem.price,
                    available: newMenuItem.available
                },
                { headers }
            );

            // Refresh menu items
            await fetchMenuItems();

            resetForm();
            setError('');
        } catch (err) {
            console.error('Error updating menu item:', err);
            console.error('Error details:', err.response?.data);
            setError(`Failed to update menu item: ${err.response?.data || err.message}`);
        }
    };

    const handleDeleteMenuItem = async (id) => {
        // Confirm before deleting
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                console.log("Deleting menu item:", id);

                await axios.delete(
                    `http://localhost:8080/api/restaurants/${restaurantId}/menu/${id}`,
                    { headers }
                );

                // Refresh menu items
                await fetchMenuItems();

            } catch (err) {
                console.error('Error deleting menu item:', err);
                console.error('Error details:', err.response?.data);
                setError(`Failed to delete menu item: ${err.response?.data || err.message}`);
            }
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
                                        className="btn-orange btn btn-warning d-inline-block"
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
                                                    <div className="col-md-8 mb-3">
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
                                                    <div className="col-md-4 mb-3">
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
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
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
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="available"
                                                                name="available"
                                                                checked={newMenuItem.available}
                                                                onChange={handleInputChange}
                                                            />
                                                            <label className="form-check-label" htmlFor="available">
                                                                Available
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary me-2"
                                                        onClick={resetForm}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="btn-orange btn btn-warning">
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
                                        <div className="text-orange spinner-border text-warning" role="status">
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
                                                                    {item.available === false &&
                                                                        <span className="badge bg-danger ms-2">Not Available</span>
                                                                    }
                                                                </div>
                                                                <p className="text-muted mb-2">{item.description}</p>
                                                            </div>
                                                            <div className="col-md-4 d-flex flex-column justify-content-between align-items-end text-md-end">
                                                                <h5 className="text-orange mb-3">${item.price.toFixed(2)}</h5>
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