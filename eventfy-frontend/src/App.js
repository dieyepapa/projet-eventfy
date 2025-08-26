import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EventList from './components/Events/EventList';
import EventDetail from './components/Events/EventDetail';
import CreateEvent from './components/Events/CreateEvent';
import EditEvent from './components/Events/EditEvent';
import ParticipantsList from './components/Events/ParticipantsList';
import CategoryManagement from './components/Categories/CategoryManagement';
import MyEvents from './components/Events/MyEvents';
import OrganizerDashboard from './components/Dashboard/OrganizerDashboard';
import ParticipantDashboard from './components/Dashboard/ParticipantDashboard';

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.profile?.role === 'organizer' || user?.role === 'organizer') {
    return <OrganizerDashboard />;
  } else {
    return <ParticipantDashboard />;
  }
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Layout
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <AppLayout>
              <EventList />
            </AppLayout>
          } />
          
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={
            <ProtectedRoute>
              <AppLayout>
                <EditEvent />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/events/:id/participants" element={
            <ProtectedRoute>
              <ParticipantsList />
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute>
              <CategoryManagement />
            </ProtectedRoute>
          } />
          <Route path="/my-events" element={
            <ProtectedRoute>
              <MyEvents />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
                  <p className="text-gray-600 mt-2">Page en cours de développement</p>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-events" element={
            <ProtectedRoute>
              <AppLayout>
                <MyEvents />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardRouter />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/create-event" element={
            <ProtectedRoute>
              <AppLayout>
                <CreateEvent />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/categories" element={
            <ProtectedRoute>
              <AppLayout>
                <CategoryManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
