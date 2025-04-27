import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import '../App.css';
import '../styles/header.css';
import { FaShoppingCart } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderGuestMenu = () => (
    <Nav className=" align-items-center ms-auto me-3">
      <Nav.Link as={Link} to="/login" className="custom-link">
        Login
      </Nav.Link>
      <Nav.Link as={Link} to="/register">
        <button type="button" className="home-btn">
          Register
        </button>
      </Nav.Link>
    </Nav>
  );

  const renderAdminMenu = () => (
    <Nav className="admin-nav align-items-center ms-auto me-3">

    </Nav>
  );

  const renderCustomerMenu = () => (
    <Nav className="align-items-center ms-auto me-3">
      <Nav.Link as={Link} to="/customer-dashboard" className="custom-link">
        Home
      </Nav.Link>
      <Nav.Link as={Link} to="/orders" className="custom-link">
        My Orders
      </Nav.Link>
      <Nav.Link as={Link} to="/cart" className="custom-link"> {/* Sepet sayfasına link */}
        <FaShoppingCart size={20} /> {/* Sepet ikonu */}
      </Nav.Link>
      <NavDropdown
        title={email || 'User'}
        id="customer-dropdown"
        align="end"
        className="custom-link nav-dropdown"
      >
        <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={handleLogOut}>Logout</NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );

  const renderRestaurantMenu = () => (
    <Nav className="ms-auto me-3 align-items-center">
      <Nav.Link as={Link} to="/restaurant-dashboard" className="custom-link">
        Dashboard
      </Nav.Link>
      <Nav.Link as={Link} to="/menu-management" className="custom-link">
        Menus
      </Nav.Link>
      <NavDropdown title={email || 'RESTAURANT'} id="restaurant-dropdown" align="end"
        className="custom-link nav-dropdown">
        <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>

        <NavDropdown.Divider />
        <NavDropdown.Item onClick={handleLogOut}>Logout</NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );

  const renderCourierMenu = () => (
    <Nav className="ms-auto me-3 align-items-center">
      <Nav.Link as={Link} to="/courier-dashboard" className="custom-link">
        Dashboard
      </Nav.Link>
      <Nav.Link as={Link} to="/my-deliveries" className="custom-link">
        My Deliveries
      </Nav.Link>
      <Nav.Link as={Link} to="/courier-restaurant" className="custom-link">
        Restaurants
      </Nav.Link>
      <NavDropdown title={email || 'Courier'} id="courier-dropdown" align="end"
        className="custom-link nav-dropdown">
        <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={handleLogOut}>Logout</NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );

  const getHomeLink = () => {
    if (!isLoggedIn) return '/';
    switch (role) {
      case 'customer': return '/customer-dashboard';
      case 'restaurant': return '/restaurant-dashboard';
      case 'courier': return '/courier-dashboard';
      default: return '/';
    }
  };

  const renderMenu = () => {
    if (!isLoggedIn) return renderGuestMenu();
    switch (role) {
      case 'customer': return renderCustomerMenu();
      case 'restaurant_owner': return renderRestaurantMenu();
      case 'courier': return renderCourierMenu();
      case 'admin': return renderAdminMenu();
      default: return renderGuestMenu();
    }
  };

  return (
    <Navbar variant="dark" expand="lg" className={role === 'admin' ? 'admin-navbar' : ''}>
      {role !== 'admin' && (
        <Navbar.Brand>
          <Link className="navbar-brand" to={getHomeLink()}>
            <img
              alt="Mealmate Logo"
              src={require("../assets/images/mmatelogo2.png")}
              className="navbar-logo"
            />
          </Link>
        </Navbar.Brand>
      )}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {renderMenu()}
      </Navbar.Collapse>
    </Navbar>
  );
};


export default Header;