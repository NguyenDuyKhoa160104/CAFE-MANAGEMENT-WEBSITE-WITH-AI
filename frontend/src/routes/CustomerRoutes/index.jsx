import { Route } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import { CustomerAuthProvider } from '../../contexts/CustomerAuthContext';
import { CustomerCartProvider } from '../../contexts/CustomerCartContext';
import { CustomerGuestGuard, CustomerProtectedGuard } from './CustomerGuards';

// Pages
import Home from '../../pages/Customer/Home';
import Menu from '../../pages/Customer/Menu';
import Reservation from '../../pages/Customer/Reservation';
import Cart from '../../pages/Customer/Cart';
import Checkout from '../../pages/Customer/Checkout';
import Orders from '../../pages/Customer/Orders';
import OrderDetail from '../../pages/Customer/OrderDetail';
import Invoices from '../../pages/Customer/Invoices';
import InvoiceDetail from '../../pages/Customer/InvoiceDetail';
import Profile from '../../pages/Customer/Profile';
import Login from '../../pages/Customer/Login';
import Register from '../../pages/Customer/Register';

const customerRoutes = (
    <Route element={<CustomerAuthProvider><CustomerCartProvider><CustomerLayout /></CustomerCartProvider></CustomerAuthProvider>}>
        
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Guest Routes (Only for unauthenticated users) */}
        <Route element={<CustomerGuestGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes (Only for authenticated users) */}
        <Route element={<CustomerProtectedGuard />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/profile" element={<Profile />} />
        </Route>
    </Route>
);

export default customerRoutes;
