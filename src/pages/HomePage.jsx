import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
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
import JoinForm from '../components/home/JoinForm';

const HomePage = () => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const { refresh } = useData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openJoinForm = (plan = '') => {
    setSelectedPlan(plan);
    setShowJoinForm(true);
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar onJoinClick={() => openJoinForm('')} />
      <Home onJoinClick={() => openJoinForm('')} />
      <About />
      <WhyChooseUs />
      <Batches onJoinClick={() => openJoinForm('')} />
      <Membership onJoinClick={openJoinForm} />
      <Transformations />
      <Experts />
      <Events />
      <Feedback />
      <Contact />
      <Footer />
      <AnimatePresence>
        {showJoinForm && (
          <JoinForm
            onClose={() => setShowJoinForm(false)}
            selectedPlan={selectedPlan}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;