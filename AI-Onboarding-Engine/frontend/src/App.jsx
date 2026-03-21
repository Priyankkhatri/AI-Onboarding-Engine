import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Results from './pages/Results';

const AnimatedRoutes = ({ setAnalysisData, analysisData }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard setAnalysisData={setAnalysisData} />} />
        <Route path="/upload" element={<Upload setAnalysisData={setAnalysisData} />} />
        <Route path="/results" element={<Results data={analysisData} setAnalysisData={setAnalysisData} />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [analysisData, setAnalysisData] = useState(null);

  // Background particle effect logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-dark-500 relative overflow-x-hidden selection:bg-gold-500/30 selection:text-gold-200">
        
        {/* Dynamic Animated Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111318_1px,transparent_1px),linear-gradient(to_bottom,#111318_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
          
          <motion.div 
            animate={{ 
              x: mousePosition.x * 0.05, 
              y: mousePosition.y * 0.05 
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              x: mousePosition.x * -0.03, 
              y: mousePosition.y * -0.03 
            }}
            transition={{ type: "spring", stiffness: 40, damping: 20 }}
            className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[150px]" 
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-400/[0.015] rounded-full blur-[200px]" />
        </div>

        <Navbar />

        <main className="relative z-10 pt-24 pb-12">
          <AnimatedRoutes setAnalysisData={setAnalysisData} analysisData={analysisData} />
        </main>
      </div>
    </Router>
  );
}

export default App;
