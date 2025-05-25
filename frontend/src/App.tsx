import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { useAuthStore } from "./store/authStore";
import Register from "./pages/Register";
import UserHome from "./pages/UserHome";
import WasteManagement from "./pages/SupportManagement";
import ProductDetail from "./pages/ProductDetail";
import WasteProducts from "./pages/SupportProducts";
import AddInventory from './pages/AddInventory';
import UpdateInventory from './pages/UpdateInventory';
import ExpiringItems from "./pages/ExpiringItems";
import LowStock from './pages/LowStock';
import AddSupplier from './pages/AddSupplier';
import UpdateSupplier from './pages/UpdateSupplier';
import SupportCustomer from "./pages/supportCustomer";
import SupportFarmer from "./pages/supportFarmer";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrderCheckout from "./pages/OrderCheckout";
import PlaceOrder from "./pages/PlaceOrder";
import AdminOrderDashboard from "./pages/AdminOrderDashboard";
import EditOrder from "./pages/EditOrder";

// Lazy load pages
const Login = React.lazy(() => import("./pages/Login"));
const Home = React.lazy(() => import("./pages/Home"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const DeliveryDashboard = React.lazy(() => import("./pages/DeliveryDashboard"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const InventoryDashboard = React.lazy(() => import('./pages/Inventory'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Suppliers = React.lazy(() => import('./pages/Suppliers'));

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Component to determine which home page to render based on user role
const HomeRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Render different home pages based on user role
  switch (user?.role) {
    case "admin":
      return <Home />;
    case "user":
      return <UserHome />;
    case "delivery":
      return <DeliveryDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route path="/" element={<HomeRoute />} />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <UserHome />
                </ProtectedRoute>
              }
            />

            <Route
              path="/waste-products"
              element={
                <ProtectedRoute>
                  <WasteProducts />
                </ProtectedRoute>
              }
            />
            {/* NEW ROUTE FOR SUPPORT CUSTOMER */}
            <Route
              path="/support-customer"
              element={
                <ProtectedRoute>
                  <SupportCustomer />
                </ProtectedRoute>
              }
            />

            {/* NEW ROUTE FOR SUPPORT FARMER */}
            <Route
              path="/support-farmer"
              element={
                <ProtectedRoute allowedRoles={["user"]}> {/* You can adjust the allowed roles if necessary */}
                  <SupportFarmer />
                </ProtectedRoute>
              }
            />

            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/product/:productId"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/Waste"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <WasteManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/deliveries"
              element={
                <ProtectedRoute allowedRoles={["delivery"]}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['delivery']}>
                <InventoryDashboard />
              </ProtectedRoute>
            } />

            {/* Add Route for AddInventory */}
            <Route path="/add-inventory" element={
              <ProtectedRoute allowedRoles={['delivery', 'inventory-manager']}>
                <AddInventory />
              </ProtectedRoute>
            } />

            <Route path="/update-inventory/:id" element={
              <ProtectedRoute allowedRoles={['delivery', 'inventory-manager']}>
                <UpdateInventory />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['delivery', 'inventory-manager']}>
                <Reports />
              </ProtectedRoute>
            } />

            {/* Add Routes for Supplier */}
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute allowedRoles={["delivery"]}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-supplier"
              element={
                <ProtectedRoute allowedRoles={['delivery', 'inventory-manager']}>
                  <AddSupplier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-supplier/:id"
              element={
                <ProtectedRoute allowedRoles={['delivery', 'inventory-manager']}>
                  <UpdateSupplier />
                </ProtectedRoute>
              } />

            <Route path="/expiring-items" element={<ExpiringItems />} />
            <Route path="/low-stock-items" element={<LowStock />} />

            {/* Order Routes */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminOrderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute allowedRoles={["admin", "user"]}>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-order/:orderId"
              element={
                <ProtectedRoute allowedRoles={["admin", "user"]}>
                  <EditOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <OrderCheckout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/place-order"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <PlaceOrder />
                </ProtectedRoute>
              }
            />

          </Route>
        </Routes>
      </React.Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
