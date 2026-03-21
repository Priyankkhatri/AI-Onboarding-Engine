import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, BarChart3, Route, List,
  CheckCircle, XCircle, AlertTriangle, Trophy, Star
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import SkillGapChart from '../components/SkillGapChart';
import RoadmapTimeline from '../components/RoadmapTimeline';
import SkillCard from '../components/SkillCard';

export default function Results({ data, setAnalysisData }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const resultsRef = useRef(null);

  // Trigger confetti for good matches
  useEffect(() => {
    if (data && data.match_percentage >= 70) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D4A017', '#FFD966', '#FFFFFF']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#D4A017', '#FFD966', '#FFFFFF']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [data]);

  // If no data, show empty state
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-white mb-3">No Results Yet</h2>
          <p className="text-gray-400 mb-8">Upload your resume and a job description to see your skill gap analysis.</p>
          <button onClick={() => navigate('/upload')} className="gold-glow-btn">
            Go to Analysis
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'skills', label: 'Skills Detail', icon: List },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Route },
  ];

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      // Wait for React to apply exporting state classes
      await new Promise(resolve => setTimeout(resolve, 500));

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = resultsRef.current;
      if (!element) {
        setIsExporting(false);
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#0D0F13',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;
      
      // Calculate height of the image on the PDF preserving aspect ratio
      const imgHeight = (contentHeight * pdfWidth) / contentWidth;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`AI_Roadmap_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark-400/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-display font-bold text-white">Generating Your Roadmap</h2>
            <p className="text-gray-400 mt-2">Preparing multi-page high-quality PDF...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="p-2 rounded-lg bg-dark-100/60 border border-dark-50/30 hover:border-gold-500/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Analysis <span className="gold-text-gradient">Results</span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {data.matched_skills?.length || 0} matched • {data.missing_skills?.length || 0} missing • {data.learning_path?.length || 0} topics to learn
              </p>
            </div>
          </div>

          {!isExporting && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPDF}
              className="gold-outline-btn flex items-center gap-2 text-sm py-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </motion.button>
          )}
        </div>

        {/* Level Up Banner */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="glass-card mb-8 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-transparent to-transparent opacity-50" />
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-dark-200 border-2 border-gold-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,160,23,0.2)]">
                {data.match_percentage >= 80 ? (
                  <Trophy className="w-8 h-8 text-gold-400" />
                ) : (
                  <Star className="w-8 h-8 text-gold-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white mb-1">
                  {data.match_percentage >= 80 ? 'Exceptional Match!' : data.match_percentage >= 50 ? 'Strong Candidate' : 'Exploring Options'}
                </h2>
                <p className="text-gray-400 text-sm">
                  You have <span className="text-gold-400 font-semibold">{data.match_percentage}%</span> of the required skills for this role.
                </p>
              </div>
            </div>
            
            {/* Minimal Progress Bar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                <span>Current Level</span>
                <span>Job Ready</span>
              </div>
              <div className="h-2.5 w-full bg-dark-300 rounded-full overflow-hidden border border-dark-50/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.match_percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-emerald-500/50 via-gold-400 to-gold-300 relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        {!isExporting && (
          <div className="flex items-center justify-start gap-1 p-1 glass-card w-fit mb-8 relative z-20 overflow-x-auto max-w-full hide-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'text-gold-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-xl bg-gold-500/10 border border-gold-500/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div ref={resultsRef} className="relative min-h-[500px]">
          {isExporting ? (
            <div className="flex flex-col gap-12 pt-4">
              <div className="text-center pb-8 border-b border-dark-50/30">
                <h2 className="text-3xl font-bold text-white mb-2">AI Adaptive Onboarding Roadmap</h2>
                <p className="text-gray-400">Personalized Skill Gap Analysis & Learning Path</p>
                <div className="mt-4 flex justify-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold-400">{data.match_percentage}%</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Match Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{data.matched_skills?.length || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Matched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{data.missing_skills?.length || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Missing</div>
                  </div>
                </div>
              </div>

              <section>
                <h3 className="text-lg font-bold text-gold-400 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Skill Analysis Overview
                </h3>
                <SkillGapChart
                  skillGaps={data.skill_gaps}
                  matchPercentage={data.match_percentage}
                />
              </section>

              <section>
                <h3 className="text-lg font-bold text-gold-400 mb-6 flex items-center gap-2">
                  <List className="w-5 h-5" /> Detailed Technical Gaps
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4">Resume Skills</h4>
                    <div className="space-y-2">
                      {data.resume_skills?.map((skill, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-dark-300/30 border border-dark-50/10">
                          <span className="text-sm text-white">{skill.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-dark-50 text-gray-400 uppercase tracking-tighter">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4">Gap Analysis</h4>
                    <div className="space-y-2">
                      {data.skill_gaps?.map((gap, i) => (
                        <SkillCard key={i} gap={gap} index={i} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gold-400 mb-6 flex items-center gap-2">
                  <Route className="w-5 h-5" /> Step-by-Step Learning Path
                </h3>
                <RoadmapTimeline learningPath={data.learning_path} isExporting={true} />
              </section>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                  className="absolute inset-x-0 top-0"
                >
                  <SkillGapChart
                    skillGaps={data.skill_gaps}
                    matchPercentage={data.match_percentage}
                  />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-gray-300">Matched ({data.matched_skills?.length || 0})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {data.matched_skills?.map((skill, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <h3 className="text-sm font-semibold text-gray-300">Missing ({data.missing_skills?.length || 0})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {data.missing_skills?.map((skill, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/15">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-gold-400" />
                      <h3 className="text-sm font-semibold text-gray-300">Bonus Skills ({data.bonus_skills?.length || 0})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {data.bonus_skills?.map((skill, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/15">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              )}

              {/* Skills Detail Tab */}
              {activeTab === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                  className="absolute inset-x-0 top-0"
                >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                      Your Resume Skills ({data.resume_skills?.length || 0})
                    </h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {data.resume_skills?.map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-dark-300/30 border border-dark-50/15"
                        >
                          <span className="text-sm text-white">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{skill.category}</span>
                            <span className={`level-badge ${
                              skill.level === 'Advanced' ? 'level-advanced' :
                              skill.level === 'Intermediate' ? 'level-intermediate' : 'level-beginner'
                            }`}>
                              {skill.level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                      Skill Gap Analysis ({data.skill_gaps?.length || 0})
                    </h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {data.skill_gaps?.map((gap, i) => (
                        <SkillCard key={i} gap={gap} index={i} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Roadmap Tab */}
            {activeTab === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                className="absolute inset-x-0 top-0"
              >
                <RoadmapTimeline learningPath={data.learning_path} />
              </motion.div>
            )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
