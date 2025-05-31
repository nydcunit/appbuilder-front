import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ZIndexProvider } from './components/ZIndexContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Databases from './pages/Databases/Databases';
import Builder from './pages/Builder/Builder';
import AppRuntime from './components/AppRuntime';
import Layout from './components/Layout';
import './App.css';

// Component to protect routes that require authentication
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  // Check if we're on a subdomain
  const hostname = window.location.hostname;
  const isSubdomain = hostname !== 'localhost' && hostname.includes('.localhost');
  
  // If on subdomain, show app runtime with routing support
  if (isSubdomain) {
    return (
      <Routes>
        <Route path="/*" element={<AppRuntime />} />
      </Routes>
    );
  }
  
  // Otherwise show normal routes
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/databases" 
        element={
          <PrivateRoute>
            <Layout>
              <Databases />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/databases/:databaseId" 
        element={
          <PrivateRoute>
            <Layout>
              <Databases />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/builder/:appId" 
        element={
          <PrivateRoute>
            <Builder />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ZIndexProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </ZIndexProvider>
    </AuthProvider>
  );
}

export default App;
