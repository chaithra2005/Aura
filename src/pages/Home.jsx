import React from 'react';
import './Home.css';
import service1 from '../assets/service1.jpeg'
import service2 from '../assets/service2.jpeg'
import service3 from '../assets/service3.jpeg'
import { useNavigate } from 'react-router-dom';
import { Camera, Box as BoxIcon, Users } from 'react-feather';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const handleNav = (path) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };
  return (
    <div>
      <section id="services-section" className="services" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', margin: '4rem 0' }}>
        <div
          className="service-box full"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '2.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s', border: '1px solid #eee', marginBottom: '1.5rem', minHeight: 180
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
          className="service-box full"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '2.5rem', border: '1px solid #eee', marginBottom: '1.5rem', minHeight: 180, cursor: 'pointer', transition: 'box-shadow 0.2s'
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
          className="service-box full"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '2.5rem', border: '1px solid #eee', minHeight: 180, cursor: 'pointer', transition: 'box-shadow 0.2s'
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
          className="service-box full"
          style={{
            display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px 0 rgba(51,51,51,0.06)', padding: '2.5rem', border: '1px solid #eee', minHeight: 180, cursor: 'pointer', transition: 'box-shadow 0.2s'
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
    </div>
  );
};

export default Home;
