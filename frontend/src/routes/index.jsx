import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import adminRoutes from './AdminRoutes';
import staffRoutes from './StaffRoutes';
import customerRoutes from './CustomerRoutes';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            {adminRoutes}
            {staffRoutes}
            {customerRoutes}
        </Route>
    )
);

export default router;
