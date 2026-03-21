import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
  strong: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    label: 'Matched',
  },
  weak: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    label: 'Needs Work',
  },
  missing: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Missing',
  },
};

const LEVEL_STYLES = {
  Beginner: 'level-beginner',
  Intermediate: 'level-intermediate',
  Advanced: 'level-advanced',
};

export default function SkillCard({ gap, index }) {
  const config = STATUS_CONFIG[gap.status] || STATUS_CONFIG.missing;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`flex items-center justify-between p-3 rounded-xl ${config.bg} border ${config.border} transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`w-4 h-4 ${config.color} flex-shrink-0`} />
        <span className="text-sm text-white font-medium truncate">{gap.skill}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {gap.current_level && (
          <span className={`level-badge ${LEVEL_STYLES[gap.current_level] || ''}`}>
            {gap.current_level}
          </span>
        )}
        <span className="text-xs text-gray-600">→</span>
        <span className={`level-badge ${LEVEL_STYLES[gap.required_level] || ''}`}>
          {gap.required_level}
        </span>
      </div>
    </motion.div>
  );
}
