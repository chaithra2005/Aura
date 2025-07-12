import React, { useEffect } from 'react';
import './Home.css';
import service1 from '../assets/service1.jpeg'
import service2 from '../assets/service2.jpeg'
import service3 from '../assets/service3.jpeg'
import { useNavigate } from 'react-router-dom';
import { Camera, Box as BoxIcon, Users } from 'react-feather';
import { Box, Typography, Button } from '@mui/material';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const handleNav = (path) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    document.body.classList.add('hide-scrollbar');
    return () => document.body.classList.remove('hide-scrollbar');
  }, []);

  return (
    <Box sx={{ width: '100vw', px: 0 }}>
      {/* Hero content directly in Home page */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: '60vh',
        py: { xs: 4, md: 8 },
        mb: 4,
        px: { xs: 2, md: 4 }
      }}>
        {/* Text Section */}
        <Box sx={{ maxWidth: { xs: '100%', md: '600px' }, zIndex: 2, py: { xs: 4, md: 8 } }}>
          <Typography
            component="h1"
            variant="h2"
            color="inherit"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Capture Your Perfect Moment
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Rent professional cameras and equipment for your next photoshoot.
            High-quality gear, flexible rental periods, and exceptional service.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 2, fontWeight: 600 }}
            onClick={() => {
              const section = document.getElementById('services-section');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Browse Services
          </Button>
        </Box>
        {/* Decorative Logo Section (hidden on mobile) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', flex: 1, pl: 6, height: '100%' }}>
          <div
            className="hero-logo-circle"
            style={{
              width: 400,
              height: 400,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 8px 32px 0 rgba(51,51,51,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              border: '6px solid #d7ccc8',
              transition: 'transform 0.35s cubic-bezier(.4,2,.6,1), box-shadow 0.35s cubic-bezier(.4,2,.6,1)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/about')}
          >
            <img
              src="/logo.jpg"
              alt="Aperture Aura Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          </div>
        </Box>
      </Box>
      <section id="services-section" className="services" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem', margin: 0, paddingLeft: '16px', paddingRight: '16px' }}>
        <div
          className="service-box"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s', border: '1px solid #eee', minHeight: 180, width: '100%', margin: 0
          }}
          onClick={() => handleNav('/featured')}
        >
          <Camera size={56} color="#FF6B6B" style={{ marginRight: 32 }} />
          <div className="service-content" style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '2rem', margin: 0, color: '#222' }}>Cameras</h3>
            <p style={{ color: '#666', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>Browse and rent professional cameras for every need.</p>
          </div>
        </div>
        <div
          className="service-box"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s', border: '1px solid #eee', minHeight: 180, width: '100%', margin: 0
          }}
          onClick={() => handleNav('/accessories')}
        >
          <BoxIcon size={56} color="#FF6B6B" style={{ marginRight: 32 }} />
          <div className="service-content" style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '2rem', margin: 0, color: '#222' }}>Accessories</h3>
            <p style={{ color: '#666', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>Find essential camera accessories to complete your kit.</p>
          </div>
        </div>
        <div
          className="service-box"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s', border: '1px solid #eee', minHeight: 180, width: '100%', margin: 0
          }}
          onClick={() => handleNav('/freelancers')}
        >
          <Users size={56} color="#FF6B6B" style={{ marginRight: 32 }} />
          <div className="service-content" style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '2rem', margin: 0, color: '#222' }}>Freelancers</h3>
            <p style={{ color: '#666', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>Hire professional freelancers and view their rates.</p>
          </div>
        </div>
        <div
          className="service-box"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s', border: '1px solid #eee', minHeight: 180, width: '100%', margin: 0
          }}
          onClick={() => handleNav('/packages')}
        >
          <BoxIcon size={56} color="#FF6B6B" style={{ marginRight: 32 }} />
          <div className="service-content" style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '2rem', margin: 0, color: '#222' }}>Photo/Video Shoot Packages</h3>
            <p style={{ color: '#666', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>Explore our photo and video shoot packages.</p>
          </div>
        </div>
      </section>
      {/* Footer content as a section */}
      <section style={{ width: '100%', background: '#f5f5f5', borderTop: '1px solid #eee', marginTop: 48, padding: '32px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 220, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ marginRight: 8, color: '#333', fontSize: 18 }}>📷</span>
                <span style={{ fontWeight: 800, fontSize: 20 }}> Aperture Aura</span>
              </div>
              <div style={{ color: '#666', fontSize: 14 }}>
                Capture your perfect moment with our high-quality equipment.
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 180, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Links</div>

              <div><a href="/about" style={{ color: '#333', textDecoration: 'none', display: 'block', marginBottom: 4 }}>About Us</a></div>
              <div><a href="/rental-terms" style={{ color: '#333', textDecoration: 'none', display: 'block', marginBottom: 4 }}>Rental Terms</a></div>
   
            </div>
            <div style={{ flex: 1, minWidth: 220, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact Info</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                Camera rental office near Nitte college<br /> Padil
              </div>
              <div style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Email: jithshdas08@gmail.com<br />Phone: 8431890748</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 13, marginTop: 32 }}>
            © 2025 Aperture Aura. All rights reserved.
          </div>
        </div>
      </section>
    </Box>
  );
};

export default Home;
