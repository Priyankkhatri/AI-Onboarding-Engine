import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon, FileText, X, Send, AlertCircle,
  CheckCircle, Loader2, Sparkles
} from 'lucide-react';
import { analyzResume } from '../services/api';

export default function Upload({ setAnalysisData }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload your resume.');
      return;
    }
    if (!jdText.trim()) {
      setError('Please paste the job description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await analyzResume(file, jdText);
      setAnalysisData(data);
      navigate('/results');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sampleJD = `Senior Full Stack Developer

We are looking for an experienced Full Stack Developer to join our team.

Requirements:
- 3+ years of experience with React, Next.js, and TypeScript
- Strong proficiency in Node.js and Express or NestJS
- Experience with PostgreSQL and MongoDB databases
- Familiarity with Docker, AWS, and CI/CD pipelines
- Knowledge of GraphQL and RESTful API design
- Experience with TailwindCSS or similar CSS frameworks
- Understanding of Agile/Scrum methodologies
- Git version control proficiency

Nice to have:
- Experience with Machine Learning or AI integrations
- Knowledge of Kubernetes and microservices architecture
- Experience with real-time applications (WebSocket)`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
      
      {/* Background Orbs specific to upload */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"
      />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {/* Header */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
          }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-4 tracking-tight">
            Analyze Your <span className="gold-text-gradient">Profile</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-lg font-light leading-relaxed">
            Upload your resume and paste a job description to discover skill gaps and get a personalized roadmap.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Upload */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
            }}
            className="glass-card p-8 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 rounded-lg bg-dark-200 border border-gold-500/20 shadow-[0_0_15px_rgba(212,160,23,0.1)]">
                <FileText className="w-5 h-5 text-gold-400" />
              </div>
              <h2 className="font-display font-bold text-white text-xl tracking-wide">Resume</h2>
            </div>

            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-gold-400 bg-gold-500/10'
                  : file
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-dark-50 hover:border-gold-500/30 hover:bg-gold-500/5'
              }`}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
                    <p className="text-white font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-3 flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <UploadIcon className="w-10 h-10 text-gray-500 mb-3" />
                    <p className="text-gray-300 font-medium mb-1">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-gray-500">or click to browse • PDF, DOCX, TXT (max 10MB)</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Job Description */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, delay: 0.1 } }
            }}
            className="glass-card p-8 relative group cursor-text"
            onClick={() => document.getElementById('jd-textarea')?.focus()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-dark-200 border border-gold-500/20 shadow-[0_0_15px_rgba(212,160,23,0.1)]">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                <h2 className="font-display font-bold text-white text-xl tracking-wide">Job Description</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setJdText(sampleJD); }}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors border border-gold-500/30 px-3 py-1.5 rounded-md hover:bg-gold-500/10 shadow-[0_0_10px_rgba(212,160,23,0.05)]"
              >
                Load Sample
              </motion.button>
            </div>

            <textarea
              id="jd-textarea"
              value={jdText}
              onChange={(e) => {
                setJdText(e.target.value);
                setError('');
              }}
              placeholder="Paste the target job description here..."
              className="w-full h-[232px] bg-dark-400/50 border border-dark-50/80 rounded-xl px-5 py-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 resize-none transition-all font-mono shadow-inner relative z-10"
            />
            <p className="text-xs text-gray-500 mt-3 font-medium flex justify-between">
              <span>{jdText.length > 0 ? `${jdText.split(/\s+/).filter(Boolean).length} words` : 'Tip: Include required skills and responsibilities'}</span>
              <span className={jdText.length > 50 ? 'text-emerald-400/80' : 'text-gray-600'}>
                {jdText.length > 0 ? (jdText.length > 50 ? 'Good length' : 'Too short') : ''}
              </span>
            </p>
          </motion.div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.3 } }
          }}
          className="mt-12 flex justify-center"
        >
          <motion.button
            whileHover={!loading ? { scale: 1.03, boxShadow: "0 0 25px rgba(212, 160, 23, 0.4)" } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            onClick={handleSubmit}
            disabled={loading}
            className="gold-glow-btn relative overflow-hidden flex items-center justify-center gap-3 text-lg font-bold px-12 py-4 disabled:opacity-70 disabled:cursor-not-allowed group w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                <span className="relative z-10 tracking-wide">Processing Profile...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                <span className="relative z-10 tracking-wide">Analyze & Generate Roadmap</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
