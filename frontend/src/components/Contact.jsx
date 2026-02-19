/**
 * Contact Component
 * Contact form and information page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowLeft } from 'lucide-react';
import '../styles/contact.css';

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send contact form to backend API
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Failed to send email:', data.message);
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <header className="contact-header">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="header-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <img src="/logo.svg" alt="Typen" />
            </div>
            <span className="logo-text">Typen</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {/* <section className="contact-hero">
        <div className="container">
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section> */}

      {/* Contact Content */}
      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2 className="info-title">
                <MessageCircle className="title-icon" size={24} />
                Contact Information
              </h2>
              <p className="info-description">
                Reach out to us through any of the following channels. 
                We're here to help with your writing needs.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">
                    <Mail size={20} />
                  </div>
                  <div className="method-content">
                    <h3>Email</h3>
                    <p>22BQ1A05E4@vvit.net</p>
                    <span className="method-note">Response within 24 hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <Phone size={20} />
                  </div>
                  <div className="method-content">
                    <h3>Phone</h3>
                    <p>+91 9346311161</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="method-content">
                    <h3>Address</h3>
                    <p>VVIT College Road,<br />Namburu 522508</p>
                  </div>
                </div>
              </div>

              {/* Team Section */}
              <div className="team-section">
                <h3>Our Team</h3>
                <div className="team-links">
                  <a href="https://www.linkedin.com/in/pallavi-motamarri-3350b226a/" target="_blank" rel="noopener noreferrer">
                    👩‍💻 Pallavi
                  </a>
                  <a href="https://www.linkedin.com/in/venkatesh-mamidala-17b38426a/" target="_blank" rel="noopener noreferrer">
                    👨‍💻 Venky
                  </a>
                  <a href="https://www.linkedin.com/in/nivas-sharma-77441b362/" target="_blank" rel="noopener noreferrer">
                    👨‍💻 Nivas
                  </a>
                  <a href="https://github.com/Arun3001c" target="_blank" rel="noopener noreferrer">
                    👨‍💻 Arun
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h2 className="form-title">
                <Send className="title-icon" size={24} />
                Send us a Message
              </h2>

              {submitStatus === 'success' && (
                <div className="status-message success">
                  Message sent successfully! We will get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="status-message error">
                  Failed to send message. Please try again.
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className={`form-input ${errors.subject ? 'error' : ''}`}
                      placeholder="Enter message subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                    {errors.subject && (
                      <span className="error-message">{errors.subject}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    className={`form-textarea ${errors.message ? 'error' : ''}`}
                    placeholder="Enter your message here..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  {errors.message && (
                    <span className="error-message">{errors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="btn-icon" size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
