import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products/Product";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/Orders/OrderDetail/OrderDetail";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories/Category";
import Settings from "./pages/Settings";
import { useAuthStore } from "./stores/authStore";
import { initDarkMode } from "./stores/darkModeStore";
import AppWrapper from "./AppWrapper";

const { Content } = Layout;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    initDarkMode();
  }, []);

  return (
    <AppWrapper>
      <Router>
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
                        margin: 24,
                        padding: 24,
                        minHeight: 280,
                        background: "inherit",
                      }}
                    >
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:orderId" element={<OrderDetail />} />
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
    </AppWrapper>
  );
};

export default App;