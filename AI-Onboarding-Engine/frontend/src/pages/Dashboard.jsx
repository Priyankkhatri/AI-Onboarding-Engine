import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Upload, Zap, Target, BookOpen, ArrowRight, BarChart3, Cpu, ChevronRight } from 'lucide-react';
import { getDemoData } from '../services/api';
import { useState, useRef } from 'react';

export default function Dashboard({ setAnalysisData }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    setLoading(true);
    try {
      const data = await getDemoData();
      setAnalysisData(data);
      navigate('/results');
    } catch (err) {
      alert('Failed to load demo data. Make sure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Cpu,
      title: 'AI-Powered Parsing',
      desc: 'Intelligent extraction of skills from your resume and job descriptions using NLP.',
    },
    {
      icon: Target,
      title: 'Skill Gap Analysis',
      desc: 'Precise comparison of your skills vs job requirements with visual breakdown.',
    },
    {
      icon: BookOpen,
      title: 'Learning Roadmap',
      desc: 'Step-by-step personalized path with curated resources and time estimates.',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      desc: 'Get actionable insights in seconds, not hours. Built for speed.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    }
  };

  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 relative">
      
      {/* Background Floating Elements */}
      <motion.div 
        style={{ y: yPos, opacity }}
        className="absolute top-20 left-10 w-32 h-32 bg-gold-500/10 rounded-full blur-[60px] pointer-events-none"
      />
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]), opacity }}
        className="absolute top-40 right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"
      />

      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-16 sm:mb-28 relative z-10"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gold-500/20 blur-md rounded-full group-hover:bg-gold-500/40 transition-all duration-500" />
            <div className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-dark-200 border border-gold-500/30 text-gold-400 text-sm font-medium">
              <Sparkles className="w-4 h-4 animate-pulse-gold" />
              AI-Powered Career Intelligence
            </div>
          </div>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white leading-[1.15] mb-6 tracking-tight"
        >
          Bridge the Gap Between
          <br className="hidden sm:block" />
          <span className="relative inline-block mt-2">
            <span className="absolute -inset-1 bg-gold-500/20 blur-xl rounded-lg"></span>
            <span className="relative gold-text-gradient">Where You Are</span>
          </span>
          {' '}&{' '}
          <span className="relative inline-block mt-2">
            <span className="absolute -inset-1 bg-gold-500/20 blur-xl rounded-lg"></span>
            <span className="relative gold-text-gradient">Where You Need</span>
          </span> to Be
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Upload your resume and a job description. Our advanced AI parses your profile, 
          identifies your skill gaps, and generates a personalized learning roadmap to hit your target.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <button
            onClick={() => navigate('/upload')}
            className="group relative gold-glow-btn flex items-center justify-center gap-2 text-base w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Upload className="w-5 h-5 relative z-10" />
            <span className="relative z-10 font-bold tracking-wide">Start Analysis</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="group gold-outline-btn flex items-center justify-center gap-2 text-base w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                Loading Demo Database...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Try Interactive Demo
              </>
            )}
          </button>
        </motion.div>
      </motion.div>

      {/* Features grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32"
      >
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-dark-200 border border-gold-500/20 flex items-center justify-center mb-6 group-hover:border-gold-500/40 group-hover:shadow-[0_0_20px_rgba(212,160,23,0.15)] transition-all duration-300">
                  <Icon className="w-7 h-7 text-gold-400 group-hover:text-gold-300 transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-white text-xl mb-3">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">{f.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent -z-10" />
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4 bg-dark-500 inline-block px-8 relative">
          How It <span className="gold-text-gradient">Works</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-lg mt-4">Three simple steps to your personalized learning path</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative"
      >
        <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] border-t-2 border-dashed border-dark-50/50 -z-10" />

        {[
          { step: '01', title: 'Upload Profile', desc: 'Securely upload your resume and paste the job description you are actively targeting.', icon: Upload },
          { step: '02', title: 'AI Analysis', desc: 'Our Engine extracts your skills, intelligently cross-references them, and flags every gap.', icon: Cpu },
          { step: '03', title: 'Mastery Plan', desc: 'Receive a structured, step-by-step roadmap with exact resources and timeframes.', icon: Target },
        ].map((item, i) => (
          <motion.div key={i} variants={itemVariants} className="relative z-10 flex flex-col items-center">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-32 h-32 rounded-full glass-card flex items-center justify-center mb-6 relative group border-gold-500/20 transition-all duration-300 hover:border-gold-500/50 hover:bg-gold-500/5"
            >
              <div className="absolute -inset-2 rounded-full bg-gold-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-dark-200 border border-gold-500/30 flex items-center justify-center text-gold-400 font-display font-bold shadow-lg">
                {item.step}
              </div>
              <item.icon className="w-12 h-12 text-gray-300 group-hover:text-gold-400 transition-colors relative z-10" />
            </motion.div>
            
            <h3 className="text-2xl font-display font-semibold text-white mb-3 text-center">{item.title}</h3>
            <p className="text-gray-400 text-base leading-relaxed text-center font-light max-w-[280px]">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
