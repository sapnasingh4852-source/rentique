import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RentalProvider } from './context/RentalContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import RoleSelectionModal from './components/common/RoleSelectionModal';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductTimelinePage from './pages/ProductTimelinePage';
import CustomerDashboard from './pages/CustomerDashboard';
import DeliveryPortal from './pages/DeliveryPortal';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';

function AppRoutes() {
  const [showRoleGate, setShowRoleGate] = useState(false);

  useEffect(() => {
    const chosen = sessionStorage.getItem('rentique_role_selected');
    if (!chosen) {
      setShowRoleGate(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenRoleGate={() => setShowRoleGate(true)} />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/product/timeline-preview" element={<ProductTimelinePage />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/delivery" element={<DeliveryPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />

      {/* Role Selection Gate (Everytime site opens) */}
      <RoleSelectionModal
        isOpen={showRoleGate}
        onClose={() => setShowRoleGate(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RentalProvider>
          <AppRoutes />
        </RentalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
