import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { FaArrowUp } from 'react-icons/fa';
import Navbar from '../components/home/Navbar';
import Home from '../components/home/Home';
import About from '../components/home/About';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Batches from '../components/home/Batches';
import Membership from '../components/home/Membership';
import Transformations from '../components/home/Transformations';
import Experts from '../components/home/Experts';
import Events from '../components/home/Events';
import Feedback from '../components/home/Feedback';
import Contact from '../components/home/Contact';
import Footer from '../components/home/Footer';

const HomePage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { refresh } = useData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToContact = () => {
    const contactForm = document.getElementById('contact-form') || document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: 'smooth' });
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="bg-white min-h-screen relative">
      <Navbar onJoinClick={scrollToContact} />
      <Home onJoinClick={scrollToContact} />
      <About />
      <WhyChooseUs />
      <Batches onJoinClick={scrollToContact} />
      <Membership onJoinClick={scrollToContact} />
      <Transformations />
      <Experts />
      <Events />
      <Feedback />
      <Contact />
      <Footer />

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn cursor-pointer"
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default HomePage;