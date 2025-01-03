import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GTranslate from './components/GTranslate';
// import ConsumerDB from './pages/user/Dashboard';
// import Profile from './pages/profile'
import CompanyProfile from './pages/company/CompanyProfile';
import { toast } from 'react-toastify';
import { auth } from './pages/firebase';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ConsumerDB from './pages/user/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast.error("Please login to access this page", {
          position: "bottom-center",
        });
        navigate('/login');
      }
      setAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>;
  }

  return authenticated ? children : null;
};


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <div className="profile-container">
      <div className="content">
    <BrowserRouter>
    <GTranslate/>
      

      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            <Login 
              setIsLoggedIn={setIsLoggedIn} 
              setUserType={setUserType} 
            />
          } 
        />
        <Route path="/register" element={<Register/>} />
        <Route
          path="/companiesDB"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
        path='/companyprofile' element={<CompanyProfile/>}
        />
         <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
        <Route
          path="/consumersDB"
          element={
            <ProtectedRoute>
              <ConsumerDB />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
    </div>
    </div>
    </AuthProvider>
  );
};

export default App;
