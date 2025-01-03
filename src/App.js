import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GTranslate from './components/GTranslate';
import ConsumerDB from './pages/user/Dashboard';
// import Profile from './pages/profile'
import CompanyProfile from './pages/company/CompanyProfile';
import { toast } from 'react-toastify';
import { auth } from './pages/firebase';


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


  return (
    <BrowserRouter>
    <GTranslate/>
      

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/companiesDB"
          element={
            <ProtectedRoute>
              <CompaniesDB />
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
       

      </Routes>
    </BrowserRouter>
  );
};

export default App;
