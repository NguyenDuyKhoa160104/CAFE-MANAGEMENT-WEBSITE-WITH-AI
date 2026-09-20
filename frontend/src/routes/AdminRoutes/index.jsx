import { Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Dashboard from '../../pages/Admin/Dashboard';
import AdminLogin from '../../pages/Admin/Login';
import MenuManagement from '../../pages/Admin/MenuManagement';
import Profile from '../../pages/Admin/Profile';
import TableManagement from '../../pages/Admin/TableManagement';
import StaffManagement from '../../pages/Admin/StaffManagement';
import useAdminAuth from '../../hooks/useAdminAuth';

const ProtectedAdminRoute = ({ children }) => {
    const { isLoggedIn } = useAdminAuth();

    if (!isLoggedIn) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

const PublicAdminRoute = ({ children }) => {
    const { isLoggedIn } = useAdminAuth();

    if (isLoggedIn) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

const adminRoutes = (
    <Route>
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="menus" element={<MenuManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="staffs" element={<StaffManagement />} />
            <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/admin/login" element={<PublicAdminRoute><AdminLogin /></PublicAdminRoute>} />
    </Route>
);

export default adminRoutes;
