import { Route, Navigate } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';
import StaffDashboard from '../../pages/Staff/Dashboard';
import StaffTableOperation from '../../pages/Staff/TableOperation';
import StaffOrders from '../../pages/Staff/Orders';
import StaffMenu from '../../pages/Staff/Menu';
import StaffInvoices from '../../pages/Staff/Invoices';
import StaffProfile from '../../pages/Staff/Profile';
import StaffLogin from '../../pages/Staff/Login';
import useStaffAuth from '../../hooks/useStaffAuth';

const ProtectedStaffRoute = ({ children }) => {
    const { isLoggedIn } = useStaffAuth();

    if (!isLoggedIn) {
        return <Navigate to="/staff/login" replace />;
    }

    return children;
};

const PublicStaffRoute = ({ children }) => {
    const { isLoggedIn } = useStaffAuth();

    if (isLoggedIn) {
        return <Navigate to="/staff/dashboard" replace />;
    }

    return children;
};

const staffRoutes = (
    <Route>
        <Route path="/staff" element={<ProtectedStaffRoute><StaffLayout /></ProtectedStaffRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="tables" element={<StaffTableOperation />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="menu" element={<StaffMenu />} />
            <Route path="invoices" element={<StaffInvoices />} />
            <Route path="profile" element={<StaffProfile />} />
        </Route>

        <Route path="/staff/login" element={<PublicStaffRoute><StaffLogin /></PublicStaffRoute>} />
    </Route>
);

export default staffRoutes;
