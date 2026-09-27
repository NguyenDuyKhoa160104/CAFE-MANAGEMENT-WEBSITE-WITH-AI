import { Navigate } from 'react-router-dom';
import useAdminAuth from '../../hooks/useAdminAuth';

export function ProtectedAdminRoute({ children }) {
    const { isLoggedIn } = useAdminAuth();
    return isLoggedIn ? children : <Navigate to="/admin/login" replace />;
}

export function PublicAdminRoute({ children }) {
    const { isLoggedIn } = useAdminAuth();
    return isLoggedIn ? <Navigate to="/admin/dashboard" replace /> : children;
}
