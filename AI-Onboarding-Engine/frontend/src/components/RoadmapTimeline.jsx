import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, ExternalLink, BookOpen, Video, Code, FileText, ChevronDown, ChevronUp, Play, Flame, Target, Wrench, Check } from 'lucide-react';
import { useState } from 'react';

const RESOURCE_ICONS = {
  video: Video,
  docs: FileText,
  course: BookOpen,
  article: Code,
};

const LEVEL_STYLES = {
  Beginner: 'level-beginner',
  Intermediate: 'level-intermediate',
  Advanced: 'level-advanced',
};

export default function RoadmapTimeline({ learningPath, isExporting = false }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set([0]));
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [activeTab, setActiveTab] = useState({});

  if (!learningPath || learningPath.length === 0) return null;

  const toggleCompleted = (url) => {
    setCompletedVideos(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const setTab = (stepIndex, tabId) => {
    setActiveTab(prev => ({ ...prev, [stepIndex]: tabId }));
  };

  const toggleStep = (index) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const totalDuration = learningPath.reduce((acc, step) => {
    const match = step.duration.match(/(\d+)/);
    return acc + (match ? parseInt(match[0]) : 2);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 glass-card px-5 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-gray-300">{learningPath.length} topics</span>
        </div>
        <div className="w-px h-4 bg-dark-50" />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-gray-300">~{totalDuration} weeks estimated</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold-500/40 via-gold-500/20 to-transparent" />

        {learningPath.map((step, i) => {
          const isExpanded = isExporting || expandedSteps.has(i);
          const isLast = i === learningPath.length - 1;

          return (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="relative pl-14 pb-6"
            >
              {/* Node dot */}
              <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
                i === 0 ? 'border-gold-400 bg-gold-500/20 shadow-lg shadow-gold-500/20' : 'border-dark-50 bg-dark-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-gold-400' : 'bg-dark-50'}`} />
              </div>

              {/* Card */}
              <div className={`glass-card-hover overflow-hidden ${isExpanded ? 'ring-1 ring-gold-500/10' : ''}`}>
                {/* Header */}
                <button
                  onClick={() => toggleStep(i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-gold-500/60 flex-shrink-0">
                      {String(step.order || i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display font-semibold text-white text-base truncate">
                      {step.topic}
                    </h3>
                    <span className={`level-badge ${LEVEL_STYLES[step.level] || 'level-intermediate'} flex-shrink-0`}>
                      {step.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.duration}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-dark-50/30 px-4 pb-4"
                  >
                    <p className="text-sm text-gray-400 mt-3 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Dependencies */}
                    {step.dependencies && step.dependencies.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1.5">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.dependencies.map((dep, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-md bg-dark-50/50 text-gray-400 border border-dark-50/30">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {step.resources && step.resources.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-col gap-2">
                          {/* Videos Container */}
                          {/* Netflix-Style Video Recommendations */}
                          {/* Netflix-Style Video Recommendations */}
                          {step.resources.filter(r => r.type === 'video').length > 0 && (() => {
                            const videos = step.resources.filter(r => r.type === 'video');
                            const beginnerVideos = videos.filter(v => v.title.toLowerCase().match(/beginner|crash course|101|basics|intro|start|fundamentals/));
                            const projectVideos = videos.filter(v => v.title.toLowerCase().match(/build|project|clone|portfolio|app|practice/));
                            const popularVideos = videos;

                            const tabs = [
                              { id: 'popular', label: '🔥 Most Popular', data: popularVideos },
                              { id: 'beginner', label: '🎯 Beginner Friendly', data: beginnerVideos },
                              { id: 'project', label: '🛠 Project-Based', data: projectVideos }
                            ].filter(t => t.data.length > 0);

                            const currentTabId = activeTab[i] || tabs[0]?.id;
                            const activeVideos = tabs.find(t => t.id === currentTabId)?.data || popularVideos;

                            return (
                              <div className="mb-4 bg-dark-400/20 p-4 rounded-2xl border border-dark-50/30 shadow-inner">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                                  <h4 className="text-[14px] font-semibold text-gray-200 flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" /> 
                                    Top Learning Videos
                                  </h4>
                                  
                                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                                    {tabs.map(tab => (
                                      <button
                                        key={tab.id}
                                        onClick={(e) => { e.preventDefault(); setTab(i, tab.id); }}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                                          currentTabId === tab.id 
                                            ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' 
                                            : 'bg-dark-300 text-gray-400 border border-dark-50/50 hover:text-gray-200 hover:border-gray-600'
                                        }`}
                                      >
                                        {tab.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className={`flex gap-4 pb-2 ${isExporting ? 'flex-wrap overflow-visible justify-center' : 'overflow-x-auto snap-x hide-scrollbar'}`}>
                                  {activeVideos.map((res, j) => {
                                    let youtubeId = res.youtube_id;
                                    if (!youtubeId && res.url?.includes('youtube.com/watch?v=')) {
                                      try { youtubeId = new URL(res.url).searchParams.get('v'); } catch (e) {}
                                    }
                                    
                                    const thumbUrl = youtubeId 
                                      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                                      : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop';
                                    
                                    const isCompleted = completedVideos.has(res.url);

                                    return (
                                      <div key={`vid-${currentTabId}-${j}`} className="snap-start flex-shrink-0 w-72 group relative flex flex-col">
                                        <a
                                          href={res.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`block relative overflow-hidden rounded-xl bg-dark-200 border transition-all duration-300 ${isCompleted ? 'border-green-500/30 opacity-70' : 'border-dark-50/50 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-1'}`}
                                        >
                                          <div className="relative w-full aspect-video bg-dark-300 overflow-hidden">
                                            <img src={thumbUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                            
                                            {/* Duration Badge */}
                                            {res.duration && (
                                              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                                {res.duration}
                                              </div>
                                            )}

                                            {/* Watch Progress Indicator */}
                                            {isCompleted && (
                                              <div className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm z-10">
                                                <CheckCircle className="w-3 h-3" /> Watched
                                              </div>
                                            )}

                                            {/* Hover Play Button */}
                                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCompleted ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                                              <div className="w-12 h-12 rounded-full bg-gold-500/90 backdrop-blur-sm flex items-center justify-center text-dark-500 shadow-xl scale-90 group-hover:scale-100 transition-all duration-300">
                                                <Play className="w-5 h-5 ml-1" fill="currentColor" />
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="p-3 bg-dark-300/90 flex flex-col h-full border-t border-dark-50/50 relative">
                                            <h4 className="text-[13px] font-medium text-gray-200 line-clamp-2 leading-snug mb-2 group-hover:text-gold-400 transition-colors" title={res.title}>
                                              {res.title}
                                            </h4>
                                            <div className="mt-auto">
                                              <span className="text-[11px] text-gray-400 font-medium tracking-wide flex items-center gap-1 line-clamp-1">
                                                {res.channel || "YouTube Creator"}
                                                {res.channel && <CheckCircle className="w-3 h-3 text-gray-500" />}
                                              </span>
                                              <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5">
                                                <span>{res.views || "10K+ views"}</span>
                                                {res.published && (
                                                  <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                    <span>{res.published}</span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </a>

                                        {/* Completion Toggle Button */}
                                        <button 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleCompleted(res.url);
                                          }}
                                          className={`mt-2.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 border z-20 ${isCompleted ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-dark-300 text-gray-400 border-dark-50/50 hover:border-gold-500/30 hover:text-gold-400 hover:bg-dark-200'}`}
                                        >
                                          <Check className="w-3.5 h-3.5" /> 
                                          {isCompleted ? 'Completed' : 'Mark as Completed'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Documentation Container */}
                          {step.resources.filter(r => r.type !== 'video').length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-3">Documentation & Guides:</p>
                              <div className="space-y-2">
                                {step.resources.filter(r => r.type !== 'video').map((res, j) => {
                                  const Icon = RESOURCE_ICONS[res.type] || ExternalLink;
                                  return (
                                    <a
                                      key={`doc-${j}`}
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 rounded-xl bg-dark-300/40 border border-dark-50/20 hover:border-gold-500/20 hover:bg-dark-300/60 transition-all group"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-dark-50/50 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/10 transition-colors shadow-inner">
                                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-gold-400 transition-colors" />
                                      </div>
                                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate font-medium">
                                        {res.title}
                                      </span>
                                      <ExternalLink className="w-3.5 h-3.5 text-gray-600 ml-auto flex-shrink-0 group-hover:text-gold-500/60 transition-colors" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
