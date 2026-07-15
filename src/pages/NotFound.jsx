import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090d13] text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl -z-10 animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl -z-10 animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <span className="text-green-500 font-extrabold text-9xl tracking-widest font-poppins">404</span>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-6 mb-4 font-poppins uppercase italic text-gradient-green">
          Lost Your Strength?
        </h1>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track with your fitness training.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-glow inline-flex items-center gap-3 text-white font-bold px-8 py-3.5 rounded-xl text-lg hover:scale-105 transition-all"
        >
          <FaHome /> Back to Home
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
