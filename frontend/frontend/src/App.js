import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoginPage from "./LoginPage.jsx";
import Register from "./Register.jsx";
import VerifyEmail from "./VerifyEmail.jsx";
import ResetPassword from "./ResetPassword.jsx";
import LandingPage from "./LandingPage.jsx";
import ForgotPassword from "./ForgotPassword.js";
import PlaceOrder from "./PlaceOrder.js";
import TrackOrder from "./TrackOrder.js";
import AboutUs from "./AboutUs.jsx";
import ContactUs from "./ContactUs.js";
import CatalogForAdmin from "./CatalogForAdmin.js";
import CatalogManage from "./CatalogManage.js";
import InventoryTracker from "./InventoryTracker.js";
import StaffTasks from "./StaffTasks.js";
import HandleInventory from "./HandleInventory.js";
import AdminDashboard from "./AdminDashboard.jsx";
import CatalogForStaff from "./CatalogForStaff.js";
import CatalogForCustomer from "./CatalogForCustomer.js";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customer Journey */}
        <Route path="/customer/catalog" element={<CatalogForCustomer />} />
        <Route path="/customer/place-order" element={<PlaceOrder />} />
        <Route path="/customer/track-order" element={<TrackOrder />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Admin Management */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<CatalogForAdmin />} />
        <Route path="/admin/catalog-manage" element={<CatalogManage />} />
        <Route path="/admin/inventory" element={<HandleInventory />} />
        <Route path="/admin/inventory-tracker" element={<InventoryTracker />} />

        {/* Staff Operations */}
        <Route path="/staff/tasks" element={<StaffTasks />} />
        <Route path="/staff/catalog" element={<CatalogForStaff />} />

        {/* Storekeeper Inventory */}
        {/* <Route path="/storekeeper/inventory" element={<HandleInventory />} /> */}
        <Route path="/storekeeper/inventory-tracker" element={<InventoryTracker />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
