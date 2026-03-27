import React from 'react';
import './App.css';

const App = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <HotOnCampus />
      <Testimonial />
      <CTASection />
      <Footer />
    </div>
  );
};

const Navbar = () => (
  <nav className="navbar animate-fade-in">
    <div className="container nav-content">
      <div className="logo">
        <span className="logo-campus">Campus</span><span className="logo-kart">Cart</span>
      </div>
      <div className="nav-links">
        <a href="#home">HOME</a>
        <a href="#how">How it Works</a>
        <a href="#market">Marketplace</a>
        <a href="#community">Community</a>
      </div>
      <button className="btn btn-primary">Download App</button>
    </div>
  </nav>
);

const Hero = () => (
  <section id="home" className="hero-section section-padding animate-fade-in">
    <div className="container hero-content">
      <div className="hero-text">
        <div className="badge-verified">
          <span className="icon">🛡️</span> VERIFIED STUDENTS ONLY
        </div>
        <h1 className="hero-title">
          Buy. Sell. Bid — <br />
          <span className="gradient-text">Only Inside Your Campus.</span>
        </h1>
        <p className="hero-subtitle">
          A trusted marketplace for students to buy books, sell gadgets, and connect safely within their college. No strangers. Just peers.
        </p>
        <div className="hero-btns">
          <button className="btn btn-primary btn-lg">Download App</button>
          <button className="btn btn-outline btn-lg">Explore Marketplace</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="phone-mockup phone-1">
          <div className="phone-screen bg-glass">
             <div className="mock-card"></div>
             <div className="mock-card"></div>
          </div>
        </div>
        <div className="phone-mockup phone-2">
          <div className="phone-screen bg-glass">
            <div className="mock-card"></div>
            <div className="mock-card"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    { icon: '🛍️', title: 'Buy & Sell Easily', desc: 'List your items in seconds. Ship or meet on campus.' },
    { icon: '📊', title: 'Live Bidding System', desc: 'Get the best market value for your premium gear.' },
    { icon: '💬', title: 'Safe In-App Chat', desc: 'Coordinate meetups without ever sharing personal info.' },
    { icon: '🏢', title: 'Campus-only Market', desc: 'Filter items by your specific dorm or building.' },
    { icon: '⚡', title: 'Fast Local Deals', desc: 'No shipping delays. Meet between classes and deal.' },
    { icon: '❤️', title: 'Trusted Community', desc: 'Every user is verified. It\'s a campus-only zone.' },
  ];

  return (
    <section id="features" className="features-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Smart Campus <span className="gradient-text">Commerce.</span></h2>
          <p className="section-sub">Designed for the pace and safety of college life.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
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
    { num: 1, title: 'Download App', sub: 'iOS or Android' },
    { num: 2, title: 'Verify Email', sub: 'Use your .edu email' },
    { num: 3, title: 'List or Browse', sub: 'Upload items in seconds' },
    { num: 4, title: 'Bid or Buy', sub: 'Secure transactions' },
    { num: 5, title: 'Meet & Deal', sub: 'Easy campus swap' },
  ];

  return (
    <section id="how" className="how-section section-padding">
      <div className="container">
        <h2 className="section-title text-center">From Listing to <span className="gradient-text-alt">Sold in Minutes.</span></h2>
        <div className="steps-container">
          {steps.map((s, i) => (
            <div key={i} className="step-item">
              <div className="step-number">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HotOnCampus = () => {
  const products = [
    { img: '📚', name: 'Bio Textbook Set', price: '$83', status: 'LIVE BID' },
    { img: '🧮', name: 'TI-84 Plus CE', price: '$45', status: 'FIXED PRICE' },
    { img: '🎧', name: 'Noise-Cancelling Pro', price: '$120', status: 'LIVE BID' },
  ];

  return (
    <section id="market" className="hot-section section-padding">
      <div className="container">
        <div className="hot-header">
          <h2 className="section-title">Hot on <span className="gradient-text">Campus.</span></h2>
          <button className="btn-link">View All Items →</button>
        </div>
        <div className="products-grid">
          {products.map((p, i) => (
            <div key={i} className="product-card">
              <div className="product-img-placeholder">{p.img}</div>
              <div className="product-info">
                <div className="price-row">
                   <h3>{p.name}</h3>
                   <span className="status-badge">{p.status}</span>
                </div>
                <p className="price-tag">{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonial = () => (
  <section id="community" className="testimonial-section section-padding">
    <div className="container">
      <div className="testimonial-content">
        <div className="avatars">
           <div className="avatar">👤</div>
           <div className="avatar">👤</div>
           <div className="avatar">👤</div>
        </div>
        <q className="quote-text">
          CampusCart changed how we swap gear. I sold my old books in 20 minutes and bought a bike right outside my dorm. It's safe and stupidly fast.
        </q>
        <span className="author">Alex Rivers, <span className="uni">Junior at State University</span></span>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="cta-section section-padding">
    <div className="container">
      <div className="cta-card premium-gradient">
        <h2>Start Buying & Selling Today</h2>
        <p>Join hundreds of students on your campus. Safe, verified, and completely local.</p>
        <button className="btn btn-white btn-lg">Download App</button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="container footer-content">
      <div className="footer-left">
        <div className="logo logo-sm">CampusCart</div>
        <p className="copyright">© 2026 CampusCart — The Exclusive Student Network</p>
      </div>
      <div className="footer-links">
        <a href="#about">About</a>
        <a href="#safety">Campus Safety</a>
        <a href="#terms">Terms of Service</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#contact">Contact Support</a>
      </div>
    </div>
  </footer>
);

export default App;
