import { Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Dashboard from '../../pages/Admin/Dashboard';
import AdminLogin from '../../pages/Admin/Login';
import MenuManagement from '../../pages/Admin/MenuManagement';
import Profile from '../../pages/Admin/Profile';
import TableManagement from '../../pages/Admin/TableManagement';
import StaffManagement from '../../pages/Admin/StaffManagement';
import AdminOrders from '../../pages/Admin/Orders';
import AdminInvoices from '../../pages/Admin/Invoices';
import InventoryManagement from '../../pages/Admin/InventoryManagement';
import RolesAndAttendance from '../../pages/Admin/Roles';
import PayrollManagement from '../../pages/Admin/Payroll';
import { ProtectedAdminRoute, PublicAdminRoute } from './AdminGuards';

import AIAdmin from '../../pages/Admin/AI';
import PromotionsManagement from '../../pages/Admin/Promotions';
import Directory from '../../pages/Admin/Directory';

const adminRoutes = (
    <Route>
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Directory key="customers" kind="customers" />} />
            <Route path="reservations" element={<Directory key="reservations" kind="reservations" />} />
            <Route path="menus" element={<MenuManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="staffs" element={<StaffManagement />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="roles" element={<RolesAndAttendance />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="profile" element={<Profile />} />
            <Route path="ai" element={<AIAdmin />} />
            <Route path="promotions" element={<PromotionsManagement />} />
        </Route>

        <Route path="/admin/login" element={<PublicAdminRoute><AdminLogin /></PublicAdminRoute>} />
    </Route>
);

export default adminRoutes;
