import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>AppBuilder</h1>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link btn-primary">Sign Up</Link>
        </div>
      </nav>

      <div className="hero">
        <h1>Build Apps Without Code</h1>
        <p>Create powerful applications with our intuitive drag-and-drop interface. No programming knowledge required.</p>
        <Link to="/register" className="btn-hero">Get Started Free</Link>
      </div>

      <div className="features">
        <div className="feature">
          <h3>🎨 Drag & Drop Builder</h3>
          <p>Intuitive visual editor to build your app exactly how you want it.</p>
        </div>
        <div className="feature">
          <h3>⚡ Deploy Instantly</h3>
          <p>Publish your app with one click and share it with the world.</p>
        </div>
        <div className="feature">
          <h3>📱 Mobile Ready</h3>
          <p>Your apps work perfectly on desktop, tablet, and mobile devices.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;