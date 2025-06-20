import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCameras from './components/FeaturedCameras';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <FeaturedCameras />
      <Footer />
    </div>
  );
}

export default App;
