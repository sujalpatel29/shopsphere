import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import AdminLayout from "../components/layout/AdminLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/customer/HomePage";
import DashboardPage from "../pages/customer/DashboardPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import OrderPage from "../pages/OrderPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import OrderSelectAddressComponent from "../components/OrderSelectAddressComponent";
import OrderPaymentComponent from "../components/orderPaymentComponent";
import CheckoutPage from "../pages/customer/CheckoutPage";
import PaymentPage from "../pages/customer/PaymentPage";

/** Redirect admin users to their dashboard — prevents admins from browsing customer pages */
function RedirectIfAdmin({ children }) {
  const { currentUser } = useSelector((state) => state.auth);
  if (currentUser?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children ?? <Outlet />;
}

function ProtectedRoute() {
  const { currentUser } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(currentUser);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { currentUser } = useSelector((state) => state.auth);
  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login / Register — redirect admin to dashboard if already logged in */}
      <Route path="/login" element={<RedirectIfAdmin><LoginPage /></RedirectIfAdmin>} />
      <Route path="/register" element={<RedirectIfAdmin><RegisterPage /></RedirectIfAdmin>} />

      {/* Public Routes with Layout — admin gets redirected to dashboard */}
      <Route element={<RedirectIfAdmin />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route path="orders" element={<OrderPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
          </Route>
          <Route path="/checkout">
            <Route path="address" element={<OrderSelectAddressComponent/>} />
            <Route path="payment" element={<OrderPaymentComponent/>} />
            
          </Route>
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route path="/" element={<HomePage />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Customer routes with Navbar/Footer */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
        </Route>

        {/* Admin routes — full-screen, no Navbar/Footer */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback — admin goes to admin dashboard, others go to home */}
      <Route path="*" element={<RedirectIfAdmin><Navigate to="/" replace /></RedirectIfAdmin>} />
    </Routes>
  );
}

export default AppRoutes;
