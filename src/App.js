import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ZIndexProvider } from './components/ZIndexContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Databases from './pages/Databases/index';
import DatabaseDetail from './pages/Databases/DatabaseDetail';
import Builder from './pages/Builder';
import Layout from './components/Layout';
import './App.css';

// Component to protect routes that require authentication
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
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
              <DatabaseDetail />
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
