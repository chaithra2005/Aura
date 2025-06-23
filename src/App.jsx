import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCameras from './components/FeaturedCameras';
import Footer from './components/Footer';
import AddCamera from './components/AddCamera';
import CameraDetail from './pages/CameraDetail';
import './App.css';

function App() {
  const [refreshCameras, setRefreshCameras] = useState(false);

  const handleCameraAdded = () => {
    setRefreshCameras((prev) => !prev);
  };

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <FeaturedCameras refresh={refreshCameras} />
            </>
          } />
          <Route path="/add-camera" element={<AddCamera onCameraAdded={handleCameraAdded} />} />
          <Route path="/camera/:id" element={<CameraDetail />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
