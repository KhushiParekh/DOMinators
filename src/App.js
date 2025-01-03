import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auth } from './pages/firebase';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProducerDB from './pages/producer/Dashboard';
import CompaniesDB from './pages/company/Dashboard';
import ConsumerDB from './pages/user/Dashboard';
// import Profile from './pages/profile'
import CompanyProfile from './pages/company/CompanyProfile';
import ProducerProfile from './pages/producer/ProducerProfile';
import GTranslate from './components/GTranslate';
import { AuthProvider } from './context/AuthContext';
import Community from './components/Community';
import FloatingChatButton from './components/FloatingChatButton';

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
  // useEffect(() => {
  //   // Inject Naker.io script dynamically
  //   const script = document.createElement("script");
  //   script.setAttribute("data-who", "💎 Made with naker.io 💎");
  //   script.src =
  //     "https://d23jutsnau9x47.cloudfront.net/back/v1.0.9/viewer.js";
  //   script.setAttribute(
  //     "data-option",
  //     JSON.stringify({
  //       environment: {
  //         gradient: "radial",
  //         sensitivity: 0.8,
  //         colorStart: [59,130,246,1],
  //         colorEnd: [68,188,112,1],
  //       },
  //       particle: {
  //         life: 5,
  //         power: 0.045,
  //         texture:
  //           "https://res.cloudinary.com/naker-io/image/upload/v1566560053/circle_05.png",
  //         number: 101,
  //         colorStart: [116, 129, 92, 0.13],
  //         colorEnd: [198,188,107,0.94],
  //         sizeStart: 1.57,
  //         sizeEnd: 3.14,
  //         direction1: { x: 100, y: 100, z: 100 },
  //         direction2: { x: -100, y: -100, z: -100 },
  //       },
  //     })
  //   );
  //   document.body.appendChild(script);

  //   return () => {
  //     // Cleanup script on component unmount
  //     document.body.removeChild(script);
  //   };
  // }, []);

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
          path="/producerDB"
          element={
            <ProtectedRoute>
              <ProducerDB />
            </ProtectedRoute>
          }
        />
        <Route
        path='/producerprofile' element={<ProducerProfile/>}
        />
         <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

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
        <Route
          path="/consumersDB"
          element={
            <ProtectedRoute>
              <ConsumerDB />
            </ProtectedRoute>
          }
        />
        
       <Route path='/community' element={<Community/>}/>

      </Routes>
      <FloatingChatButton/>
    </BrowserRouter>
    
    </div>
    </div>
    </AuthProvider>
  );
};

export default App;
