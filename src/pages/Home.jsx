import React from 'react';
import './Home.css';
import service1 from '../assets/service1.jpeg'
import service2 from '../assets/service2.jpeg'
import service3 from '../assets/service3.jpeg'

const Home = () => {
  return (
    <div>

      <section className="services">
        <div className="service-box full">
          <img src={service1} alt="Service 1" className="service-img left" />
          <div className="service-content">
            <h3>Service 1</h3>
            <p>Describe your first service here...</p>
          </div>
        </div>

        <div className="service-box full">
          <div className="service-content">
            <h3>Service 2</h3>
            <p>Describe your second service here...</p>
          </div>
          <img src={service2} alt="Service 2" className="service-img right" />
        </div>

        <div className="service-box full">
          <img src={service3} alt="Service 3" className="service-img left" />
          <div className="service-content">
            <h3>Service 3</h3>
            <p>Describe your third service here...</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
