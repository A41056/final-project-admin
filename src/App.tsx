import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products/Product";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import { useAuthStore } from "./stores/authStore";
import Categories from "./pages/Categories/Category";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  startNotificationHub,
  stopNotificationHub,
} from "./services/notificationService";
import OrderDetail from "./pages/Orders/OrderDetail/OrderDetail";

const { Content } = Layout;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      startNotificationHub();
    } else {
      stopNotificationHub();
    }
    return () => {
      stopNotificationHub();
    };
  }, [isAuthenticated]);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh" }}>
                <Sidebar />
                <Layout>
                  <Navbar />
                  <Content
                    style={{
                      margin: "24px 16px",
                      padding: 24,
                      background: "#fff",
                      minHeight: 280,
                      flex: 1,
                    }}
                  >
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route
                        path="/orders/:orderId"
                        element={<OrderDetail />}
                      />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Content>
                  <Footer />
                </Layout>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
