import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddUserPage from './pages/AdminAddUserPage';
import ProfilePage from './pages/ProfilePage';
import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './pages/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Herkese açık rotalar */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/resetPassword/:token" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Giriş yapılmış herkes erişebilir */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Sadece admin erişebilir */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminUserListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/add-user"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminAddUserPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
