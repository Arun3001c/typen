import React, { useState, useEffect } from 'react';
import '../styles/landingpage.css'
// Icons
const Check = () => <span className="icon-check">✓</span>;
const MessageSquare = () => <span className="icon-message-square">💬</span>;
const Layers = () => <span className="icon-layers">📚</span>;
const FileText = () => <span className="icon-file-text">📄</span>;
const Palette = () => <span className="icon-palette">🎨</span>;
const Sparkles = () => <span className="icon-sparkles">✨</span>;
const PenTool = () => <span className="icon-pen-tool">✏️</span>;
const Users = () => <span className="icon-users">👥</span>;
const Lightbulb = () => <span className="icon-lightbulb">💡</span>;

// Typen Logo Component
// const TypenLogo = () => (
//   <div className="typen-logo">
//     <div className="logo-circle"></div>
//     <span className="logo-text">t</span>
//   </div>
// );

// DemoInput Component
const DemoInput = () => {
  const placeholderTexts = [
    "Write me a blog post about launching...",
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
    <section className="demo-input-section">
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
            
            <button className="primary-button">
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
  const principles = [
    "I won't make anything up",
    "I won't use AI-isms",
    "I won't ask rhetorical questions",
    "I will use concrete, specific details",
    "I will use the active voice",
    "I will save the punch-line for last",
  ];

  const featureCards = [
    {
      icon: MessageSquare,
      title: "typen interviews you",
      description: "typen asks targeted questions that clarify your thinking",
      example: "What makes someone choose typen over just using ChatGPT?",
      answer: "Other tools just generate. typen works with you—asking questions, clarifying your thinking, making sure you capture what you actually mean.",
    },
    {
      icon: Layers,
      title: "Drafts for every angle",
      description: "typen shows you multiple angles so you can pick the direction that resonates, then chisel it to perfection.",
      angles: ["Benefit-Driven Angle", "Creative Angle", "Productivity-Focused Angle"],
    },
    {
      icon: FileText,
      title: "typen is grounded",
      description: "Feed typen your files and context on whatever you're writing about. typen pulls from your material—facts, not hallucinations.",
    },
    {
      icon: Palette,
      title: "Write in your own style",
      description: "Share examples of your writing, your brand's voice, or favorite writers. typen matches that style.",
    },
  ];

  return (
    <section className="features-section">
      <div className="container">
        <div className="features-header">
          <h2>
            <span className="italic">typen</span> writes with taste.
          </h2>
          <p className="subtitle">
            typen writes with natural rhythm, concrete details, and clear language—good taste built in from the start.
          </p>

          <div className="principles-card">
            <div className="principles-content">
              <p className="principles-label">Writing with typen</p>
              <p className="principles-quote">Thinking about writing taste...</p>
              
              <div className="principles-list">
                {principles.map((principle, index) => (
                  <div 
                    key={principle}
                    className="principle-item fade-up"
                    style={{ 
                      animationDelay: `${index * 0.1}s`, 
                    }}
                  >
                    <div className="principle-check">
                      <Check />
                    </div>
                    <span>{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          {featureCards.map((feature, index) => (
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

              {feature.example && (
                <div className="feature-example">
                  <p className="example-question">
                    "{feature.example}"
                  </p>
                  <p className="example-answer">
                    {feature.answer}
                  </p>
                </div>
              )}

              {feature.angles && (
                <div className="angles-container">
                  {feature.angles.map((angle) => (
                    <span 
                      key={angle}
                      className="angle-pill"
                    >
                      {angle}
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
            <span className="footer-logo-text">typen</span>
          </div>
          
          <p className="footer-copyright">
            © {new Date().getFullYear()} typen. All rights reserved.
          </p>
          
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
          {/* <TypenLogo /> */}
          <span className="header-logo-text">typen</span>
        </div>
        
        <button className="primary-button">
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
    <section className="hero-section">
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
        <Hero />
        <DemoInput />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;