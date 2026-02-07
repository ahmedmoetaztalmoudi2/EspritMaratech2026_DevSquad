// Protected Route Component with Role-based Access Control
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
    const location = useLocation();

    // Show loading while checking auth
    if (isLoading) {
        return <LoadingSpinner fullScreen tip="Vérification de l'authentification..." />;
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // User doesn't have required role - redirect to their dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
