import { Route } from 'react-router-dom';

const CustomerHome = () => <div><h1 className="text-2xl font-bold">Customer Home</h1></div>;

const customerRoutes = (
  <Route path="/customer">
    <Route index element={<CustomerHome />} />
  </Route>
);

export default customerRoutes;
