import React, { useState, useEffect } from 'react';
import '../styles/landingpage.css';

// Icons as React components
const Check = () => <span className="icon">✓</span>;
const Zap = () => <span className="icon">⚡</span>;
const Brain = () => <span className="icon">🧠</span>;
const Clock = () => <span className="icon">⏰</span>;
const Globe = () => <span className="icon">🌐</span>;
const Sparkles = () => <span className="icon">✨</span>;
const PenTool = () => <span className="icon">✏️</span>;
const Users = () => <span className="icon">👥</span>;
const Lightbulb = () => <span className="icon">💡</span>;
const Palette = () => <span className="icon">🎨</span>;

// Typen Logo Component
const TypenLogo = () => (
  <div className="logo-container">
    <div className="logo-icon">
      <img src="./logo.svg" alt="icon" />
    </div>
    <span className="logo-text">Typen</span>
  </div>
);

// DemoInput Component
const DemoInput = () => {
  const placeholderTexts = [
    "Once upon a time there was a brave knight...",
    "Draft an email to my subscribers about...",
    "Create a product description for...",
    "Help me write a compelling headline for...",
  ];

  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = placeholderTexts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % placeholderTexts.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <section className="demo-input">
      <div className="container">
        <div className="demo-card">
          <div className="demo-text-container">
            <p className="demo-text">
              {displayText}
              <span className="cursor"></span>
            </p>
          </div>
          
          <div className="demo-controls">
            <button className="style-button">
              <Palette />
              <span>Styles</span>
            </button>
            
            <button className="accent-button">
              Start writing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Component
const Features = () => {
  const benefits = [
    "Save hours of writing time daily",
    "Never stare at a blank screen again",
    "Maintain your natural writing flow",
    "Context-aware predictions",
    "Works offline after initial load",
    "No subscription required",
  ];

  const featureCards = [
    {
      icon: Brain,
      title: "LSTM Deep Learning",
      description: "Powered by Long Short-Term Memory neural networks that understand context and predict your next words with remarkable accuracy.",
      highlight: "Advanced AI that learns patterns in language to suggest what comes next.",
    },
    {
      icon: Clock,
      title: "Save Precious Time",
      description: "Stop spending hours searching for the right words. typen predicts your next words instantly, letting you focus on ideas instead of typing.",
      stats: ["faster writing", "Less mental fatigue", "More creative energy"],
    },
    {
      icon: Globe,
      title: "Online Web Application",
      description: "Access typen from any device with a browser. No downloads, no installations—just open and start writing with AI-powered predictions.",
    },
    {
      icon: Sparkles,
      title: "User-Friendly Interface",
      description: "Clean, distraction-free writing environment designed for authors, bloggers, and content creators. Your words, enhanced by AI.",
    },
  ];

  return (
    <section className="features">
      <div className="container">
        <div className="features-header">
          <h2>
            Stop wasting time on <span className="accent-text italic">every word</span>.
          </h2>
          <p className="subtitle">
            Traditional editors leave you typing every single letter. typen uses LSTM deep learning to predict your next words—so you write faster and think clearer.
          </p>

          <div className="benefits-card">
            <div className="benefits-content">
              <p className="benefits-label">Why writers love typen</p>
              <p className="benefits-quote">Intelligent predictions, effortless writing...</p>
              
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div 
                    key={benefit}
                    className="benefit-item fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="benefit-check">
                      <Check />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          {featureCards.map((feature) => (
            <div 
              key={feature.title}
              className="feature-card"
            >
              <div className="feature-icon">
                <feature.icon />
              </div>
              
              <h3>{feature.title}</h3>
              <p className="feature-description">
                {feature.description}
              </p>

              {feature.highlight && (
                <div className="feature-highlight">
                  <p>{feature.highlight}</p>
                </div>
              )}

              {feature.stats && (
                <div className="stats-container">
                  {feature.stats.map((stat) => (
                    <span 
                      key={stat}
                      className="stat-pill"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <TypenLogo />
          </div>
          
          {/* <p className="footer-copyright">
            © {new Date().getFullYear()} typen. All rights reserved.
          </p> */}
            <div className="dev-team">
            {/* <p className="footer-description">Developed by</p> */}
            <div className="dev-links">
              <span>Developed by</span>
                  <a href="https://www.linkedin.com/in/pallavi-motamarri-3350b226a/" target="_blank">👩‍💻 Pallavi</a>
                  <span>|</span>
                  <a href="https://www.linkedin.com/in/venkatesh-mamidala-17b38426a/" target="_blank">👨‍💻 Venky</a>
                  <a href="https://www.linkedin.com/in/nivas-sharma-77441b362/" target="_blank">👨‍💻 Nivas</a>
                  <span>|</span>
                  <a href="https://github.com/Arun3001c" target="_blank">👨‍💻 Arun</a>
            </div>
          </div>
          
          <div className="footer-links">
            <a href="#" className="footer-link">
              Privacy
            </a>
            <a href="#" className="footer-link">
              Terms
            </a>
            <a href="#" className="footer-link">
              Contact
            </a>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

// Header Component
const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="header-logo">
          <TypenLogo />
          {/* <img src="/images/icon.svg" alt="icon" /> */}

        </div>
        
        <button className="accent-button">
          Start writing
        </button>
      </div>
    </header>
  );
};

// Hero Component
const Hero = () => {
  const rotatingWords = ["Writers", "Creators", "Thinkers", "Dreamers"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const audiences = [
    { icon: PenTool, label: "Content creators" },
    { icon: Users, label: "Marketers" },
    { icon: Sparkles, label: "Copywriters" },
    { icon: Lightbulb, label: "Founders" },
  ];

  return (
    <section className="hero">
      <div className="container">
        <h1 className="fade-up" style={{ animationDelay: "0.1s" }}>
          The Next Word
        </h1>
        
        <div className="rotating-word-container fade-up" style={{ animationDelay: "0.3s" }}>
          <span className="rotating-word-label">
            for{" "}
            <span 
              className={`rotating-word-pill ${isAnimating ? 'animating' : ''}`}
            >
              {rotatingWords[currentWordIndex]}
            </span>
          </span>
        </div>

        <p className="hero-subtitle fade-up" style={{ animationDelay: "0.5s" }}>
          Built with you in mind
        </p>

        <div className="audience-pills fade-up" style={{ animationDelay: "0.7s" }}>
          {audiences.map(({ icon: Icon, label }) => (
            <div 
              key={label}
              className="audience-pill"
            >
              <Icon />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="hero-button-container fade-up" style={{ animationDelay: "0.9s" }}>
          <button className="hero-button">
            Start writing
          </button>
        </div>
      </div>
    </section>
  );
};

// Main LandingPage Component
const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <DemoInput />
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;