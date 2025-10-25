import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CurrentMenuPage from './pages/CurrentMenuPage';
import TokenManagementPage from './pages/TokenManagementPage';
import ItemsPage from './pages/ItemsPage';
import MenusPage from './pages/MenusPage';
import SchedulesPage from './pages/SchedulesPage';
import ScreensPage from './pages/ScreensPage';
import GalleryPage from './pages/GalleryPage';
import GalleryViewPage from './pages/GalleryViewPage';
import LogsPage from './pages/LogsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Gallery View (no layout, full screen) */}
        <Route
          path="/gallery/:screenId"
          element={<GalleryViewPage />}
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="current-menu" element={<CurrentMenuPage />} />
                  <Route path="token" element={<TokenManagementPage />} />
                  <Route path="items" element={<ItemsPage />} />
                  <Route path="menus" element={<MenusPage />} />
                  <Route path="schedules" element={<SchedulesPage />} />
                  <Route path="screens" element={<ScreensPage />} />
                  <Route path="gallery" element={<GalleryPage />} />
                  <Route path="logs" element={<LogsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
