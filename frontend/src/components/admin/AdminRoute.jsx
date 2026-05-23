import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AdminRoute = ({ children }) => {
<<<<<<< HEAD
  const { user } = useAuthStore();
  
  if (!user || user.role !== 'admin') {
=======
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
>>>>>>> 804ddfb (changes)
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default AdminRoute;