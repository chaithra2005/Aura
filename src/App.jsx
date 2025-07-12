import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import FeaturedCameras from './components/FeaturedCameras';
import AddCamera from './components/AddCamera';
import CameraDetail from './pages/CameraDetail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import { auth, onAuthStateChanged } from './firebase';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Accessories from './pages/Accessories';
import AddAccessory from './pages/AddAccessory';
import Freelancers from './pages/Freelancers';
import AddFreelancer from './pages/AddFreelancer';
import Packages from './pages/Packages';
import FreelancerDetail from './pages/FreelancerDetail';
import AccessoryDetail from './pages/AccessoryDetail';
import Cart from './pages/Cart';
import PackageDetail from './pages/PackageDetail';
import AddPackage from './pages/AddPackage';
import AboutUs from './pages/AboutUs';
import './App.css';
import ScrollToTop from './ScrollToTop';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import RentalTerms from './pages/RentalTerms';
import EmailVerification from './pages/EmailVerification';
import { Box, Paper, Typography, Alert, Button } from '@mui/material';

function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);
  if (user === undefined) return null;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const [refreshCameras, setRefreshCameras] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleCameraAdded = () => {
    setRefreshCameras((prev) => !prev);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/featured" element={<FeaturedCameras refresh={refreshCameras} user={user} />} />
          <Route
            path="/add-camera"
            element={
              <PrivateRoute>
                <AddCamera onCameraAdded={handleCameraAdded} user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/accessories" element={<Accessories user={user} />} />
          <Route path="/accessories/:id" element={<AccessoryDetail />} />
          <Route
            path="/add-accessory"
            element={
              <PrivateRoute>
                <AddAccessory user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/freelancers" element={<Freelancers user={user} />} />
          <Route path="/freelancers/:id" element={<FreelancerDetail />} />
          <Route
            path="/add-freelancer"
            element={
              <PrivateRoute>
                <AddFreelancer user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/camera/:id" element={<CameraDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/rental-terms" element={<RentalTerms />} />
          <Route path="/verify-email" element={<EmailVerification />} />

          {/* ✅ Checkout Routes */}
          <Route path="/checkout/:cameraId" element={<Checkout user={user} />} />
          <Route path="/checkout" element={<Checkout user={user} />} /> {/* This was missing */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route
            path="/add-package"
            element={
              <PrivateRoute>
                <AddPackage user={user} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
