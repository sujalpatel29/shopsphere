import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/customer/HomePage";
import DashboardPage from "../pages/customer/DashboardPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import OrderPage from "../pages/OrderPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import OrderSelectAddressComponent from "../components/OrderSelectAddressComponent";
import OrderPaymentComponent from "../components/orderPaymentComponent";

function ProtectedRoute() {
  const { currentUser } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(currentUser);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { currentUser } = useSelector((state) => state.auth);
  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public Routes with Layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Protected Routes with Layout */}
      <Route element={<ProtectedRoute />}>
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
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
