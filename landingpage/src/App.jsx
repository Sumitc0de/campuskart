import React, { useState } from 'react';
import './App.css';

const App = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className={`navbar ${menuOpen ? 'menu-open' : ''}`}>
      <div className="container nav-content">
        <div className="logo">
          <span className="logo-campus">Campus</span><span className="logo-kart">Kart</span>
        </div>

        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How it Works</a>
          <button className="btn btn-primary mobile-only-btn">Download App</button>
        </div>

        <div className="nav-actions">
          <button onClick={() =>
            window.open(
              "https://drive.google.com/uc?export=download&id=1BrHNmQwvHgNFoiVlfh9UW4YvVBo_we6c",
              "_blank"
            )
          } className="btn btn-primary desktop-only-btn">Download App</button>
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section id="home" className="hero-section animate-velocity">
    <div className="container hero-content">
      <div className="hero-text">
        <div className="badge-verified">
          🛡️ CAMPUS VERIFIED ONLY
        </div>
        <h1 className="hero-title">
          The New Standard of <br />
          <span className="gradient-text">Campus Commerce.</span>
        </h1>
        <p className="hero-subtitle">
          Buy, sell, and bid securely within your college ecosystem.
          Verified .edu accounts ensure a safe haven for student trade.
        </p>
        <div className="hero-btns">
          <button onClick={() =>
            window.open(
              "https://drive.google.com/uc?export=download&id=1BrHNmQwvHgNFoiVlfh9UW4YvVBo_we6c",
              "_blank"
            )
          } className="btn btn-primary btn-lg">Download</button>
          <button className="btn btn-outline btn-lg">Explore Marketplace</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="app-preview-card">
          <div className="mock-ui-header"></div>
          <div className="mock-ui-block"></div>
          <div className="mock-ui-row"></div>
          <div className="mock-ui-row" style={{ width: '60%' }}></div>
          <div className="mock-ui-block" style={{ height: '120px', marginTop: '40px' }}></div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    { icon: '🛡️', title: 'Student Verified', desc: 'Every user is vetted through official university email verification.' },
    { icon: '⚖️', title: 'Secure Bidding', desc: 'Our dynamic bidding engine ensures fair market value for every item.' },
    { icon: '💬', title: 'Instant Chat', desc: 'Secure, real-time messaging to coordinate meetups effortlessly.' },
    { icon: '📍', title: 'Campus Specific', desc: 'Browse items exclusively within your dorm, building, or whole campus.' },
  ];

  return (
    <section id="features" className="features-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Designed for <span className="gradient-text">Velocity.</span></h2>
          <p className="section-sub">Engineered to handle the fast-paced nature of student life and campus trade.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { num: '01', title: 'Join', sub: 'Sign up with .edu' },
    { num: '02', title: 'List', sub: 'Post in seconds' },
    { num: '03', title: 'Bid', sub: 'Negotiate prices' },
    { num: '04', title: 'Chat', sub: 'Coordinate meeting' },
    { num: '05', title: 'Swap', sub: 'Secure campus exchange' },
  ];

  return (
    <section id="how" className="how-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Seamless <span className="gradient-text">Workflow.</span></h2>
        </div>
        <div className="steps-container">
          {steps.map((s, i) => (
            <div key={i} className="step-item">
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
  <section className="section-padding">
    <div className="container">
      <div className="cta-card">
        <h2>Ready to trade?</h2>
        <p>Join the exclusive network of student commerce today. Download the CampusKart app and take control of your campus marketplace.</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button className="btn btn-white btn-lg">App Store</button>
          <button className="btn btn-outline btn-lg" style={{ background: 'transparent', borderColor: 'var(--on-primary)' }}>Play Store</button>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="container footer-content">
      <div className="footer-left">
        <div className="logo" style={{ marginBottom: '1.5rem' }}>CampusKart</div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>© 2026 CampusKart. The High-Performance Student Network.</p>
      </div>
      <div className="footer-links">
        <a href="#about">About</a>
        <a href="#safety">Safety</a>
        <a href="#terms">Terms</a>
        <a href="#privacy">Privacy</a>
      </div>
    </div>
  </footer>
);

export default App;
