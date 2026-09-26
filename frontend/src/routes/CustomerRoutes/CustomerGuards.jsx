import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

export const CustomerGuestGuard = () => {
    const { isAuthenticated, isInitializing } = useCustomerAuth();

    if (isInitializing) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export const CustomerProtectedGuard = () => {
    const { isAuthenticated, isInitializing } = useCustomerAuth();
    const location = useLocation();

    if (isInitializing) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
};
