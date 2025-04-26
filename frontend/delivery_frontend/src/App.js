import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddUserPage from './pages/AdminAddUserPage';
import ProfilePage from './pages/ProfilePage';
import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './pages/PrivateRoute';
import AuthRoute from './components/AuthRoute';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard.js';
import CourierDashboard from './pages/CourierDashboard.js';
import CustomerCartPage from './pages/CustomerCartPage.js';
import CustomerOrderPage from './pages/CustomerOrderPage.js';
import CustomerCheckoutPage from './pages/CustomerCheckoutPage.js';
import RestaurantMenuPage from './pages/RestaurantMenuPage.js';
import CourierDeliveriesPage from './pages/CourierDeliveriesPage.js';
import CourierRestaurantsPage from './pages/CourierRestaurantsPage.js';

// Import new admin pages
import AdminCustomerPage from './pages/AdminCustomerPage';
import AdminRestaurantPage from './pages/AdminRestaurantPage';
import AdminCourierPage from './pages/AdminCourierPage';
import AdminAdminPage from './pages/AdminAdminPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthRoute><Home /></AuthRoute>} />
        <Route path="/home" element={<AuthRoute> <Home /> </AuthRoute>} />

        {/* Auth routes - protected from authenticated users */}
        <Route path="/login" element={<AuthRoute> <LoginPage /> </AuthRoute>} />
        <Route path="/register" element={<AuthRoute> <RegisterPage /> </AuthRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/resetPassword/:token" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Private routes - require authentication */}
        <Route path="/customer-dashboard" element={<PrivateRoute allowedRoles={['customer']}> <CustomerDashboard /> </PrivateRoute>} />
        <Route path="/restaurant-dashboard" element={<PrivateRoute allowedRoles={['restaurant_owner']}> <RestaurantDashboard /> </PrivateRoute>} />
        <Route path="/courier-dashboard" element={<PrivateRoute allowedRoles={['courier']}> <CourierDashboard /> </PrivateRoute>} />
        <Route path="/menu-management" element={<PrivateRoute allowedRoles={['restaurant_owner']}> <RestaurantMenuPage /> </PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute allowedRoles={['customer']}> <CustomerCartPage /> </PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute allowedRoles={['customer']}> <CustomerCheckoutPage /> </PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute allowedRoles={['customer']}> <CustomerOrderPage /> </PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}> <AdminDashboard /> </PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute allowedRoles={['admin']}> <AdminCustomerPage /> </PrivateRoute>} />
        <Route path="/admin/restaurants" element={<PrivateRoute allowedRoles={['admin']}> <AdminRestaurantPage /> </PrivateRoute>} />
        <Route path="/admin/couriers" element={<PrivateRoute allowedRoles={['admin']}> <AdminCourierPage /> </PrivateRoute>} />
        <Route path="/admin/admin-users" element={<PrivateRoute allowedRoles={['admin']}> <AdminAdminPage /> </PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}> <AdminUserListPage /> </PrivateRoute>} />

        <Route path="/profile" element={<PrivateRoute> <ProfilePage /> </PrivateRoute>} />

        <Route path="/my-deliveries" element={<PrivateRoute allowedRoles={['courier']}> <CourierDeliveriesPage /> </PrivateRoute>} />
        <Route path="/courier-restaurant" element={<PrivateRoute allowedRoles={['courier']}> <CourierRestaurantsPage /> </PrivateRoute>} />

      </Routes>
    </Router>
  );
};

export default App;