import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Static user data
const USERS = {
  saumitr: { id: 'user1', username: 'saumitr', name: 'Saumitr', password: 'password1' },
  anushka: { id: 'user2', username: 'anushka', name: 'Anushka', password: 'password2' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const userData = localStorage.getItem('user');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const user = USERS[username];
      
      if (!user || user.password !== password) {
        toast.error('Invalid credentials');
        return false;
      }
      
      const userData = { id: user.id, username: user.username, name: user.name };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 