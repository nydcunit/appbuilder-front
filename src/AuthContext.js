import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set the base URL for API calls
axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token with real backend
      axios.get('/api/auth/verify')
        .then(response => {
          if (response.data.success) {
            setUser(response.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { 
        name, 
        email, 
        password 
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};