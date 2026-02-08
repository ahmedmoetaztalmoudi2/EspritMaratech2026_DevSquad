// TILI App - Main Application with Routing
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Provider, useDispatch } from 'react-redux';
import frFR from 'antd/locale/fr_FR';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from './redux/store';
import { checkAuth } from './redux/authSlice';
import theme from './styles/theme';

// Layouts
import BackOfficeLayout from './layouts/BackOfficeLayout';
import FrontOfficeLayout from './layouts/FrontOfficeLayout';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import VoiceAssistant from './components/common/VoiceAssistant';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// BackOffice Pages
import DashboardAdmin from './pages/backoffice/DashboardAdmin';
import UsersManagement from './pages/backoffice/UsersManagement';
import DocumentsManagement from './pages/backoffice/DocumentsManagement';
import ReunionsManagement from './pages/backoffice/ReunionsManagement';
import ProjetsManagement from './pages/backoffice/ProjetsManagement';
import HistoriquePage from './pages/backoffice/HistoriquePage';
import DemandesReunionManagement from './pages/backoffice/DemandesReunionManagement';

// FrontOffice Pages
import Dashboard from './pages/frontoffice/Dashboard';
import MesDocuments from './pages/frontoffice/MesDocuments';
import MesProjets from './pages/frontoffice/MesProjets';
import MesReunions from './pages/frontoffice/MesReunions';
import ProfilPage from './pages/frontoffice/ProfilPage';
import NotificationsPage from './pages/common/NotificationsPage';
import Chatbot from './components/common/Chatbot';
import { useSelector } from 'react-redux';

// App Content with Auth Check
const AppContent = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.ui);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Passer au contenu principal
      </a>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* FrontOffice Routes - All authenticated users */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FrontOfficeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mes-documents" element={<MesDocuments />} />
          <Route path="mes-projets" element={<MesProjets />} />
          <Route path="mes-reunions" element={<MesReunions />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* BackOffice Routes - Only RESPONSABLE and CHEF_PROJET */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['RESPONSABLE', 'CHEF_PROJET']}>
              <BackOfficeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="documents" element={<DocumentsManagement />} />
          <Route path="reunions" element={<ReunionsManagement />} />
          <Route path="demandes-reunion" element={<DemandesReunionManagement />} />
          <Route path="projets" element={<ProjetsManagement />} />
          <Route path="historique" element={<HistoriquePage />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <VoiceAssistant />
      <Chatbot />
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme} locale={frFR}>
        <Router>
          <AppContent />
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ConfigProvider>
    </Provider>
  );
};

export default App;
