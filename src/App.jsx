import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCameras from './components/FeaturedCameras';
import Footer from './components/Footer';
import AddCamera from './components/AddCamera';
import CameraDetail from './pages/CameraDetail';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import { auth, onAuthStateChanged } from './firebase';
import './App.css';

function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);
  if (user === undefined) return null; // or a loading spinner
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
      <div className="app">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Home></Home>
              {/* <FeaturedCameras refresh={refreshCameras} user={user} /> */}
            </>
          } />
          <Route path="/featured" element={<FeaturedCameras refresh={refreshCameras} user={user} />} />
          <Route path="/add-camera" element={
            <PrivateRoute>
              <AddCamera onCameraAdded={handleCameraAdded} />
            </PrivateRoute>
          } />
          <Route path="/camera/:id" element={<CameraDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
