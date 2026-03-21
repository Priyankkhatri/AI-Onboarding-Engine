import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const STATUS_COLORS = {
  strong: '#34D399',
  weak: '#FBBF24',
  missing: '#F87171',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-300/95 backdrop-blur-sm border border-dark-50/50 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gold-400 text-xs mt-1">Score: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function SkillGapChart({ skillGaps, matchPercentage }) {
  if (!skillGaps || skillGaps.length === 0) return null;

  const levelToScore = { 'Advanced': 100, 'Intermediate': 66, 'Beginner': 33, null: 0 };

  // Bar chart data
  const barData = skillGaps.map(gap => ({
    name: gap.skill.length > 12 ? gap.skill.slice(0, 12) + '…' : gap.skill,
    fullName: gap.skill,
    current: levelToScore[gap.current_level] || 0,
    required: levelToScore[gap.required_level] || 66,
    status: gap.status,
  }));

  // Radar chart data (top 8 skills)
  const radarData = skillGaps.slice(0, 8).map(gap => ({
    subject: gap.skill.length > 10 ? gap.skill.slice(0, 10) + '…' : gap.skill,
    current: levelToScore[gap.current_level] || 0,
    required: levelToScore[gap.required_level] || 66,
  }));

  // Category counts
  const counts = { strong: 0, weak: 0, missing: 0 };
  skillGaps.forEach(g => counts[g.status]++);

  return (
    <div className="space-y-6">
      {/* Match score + stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <div className="text-3xl font-display font-bold gold-text-gradient">{matchPercentage}%</div>
          <div className="text-xs text-gray-500 mt-1">Match Score</div>
        </motion.div>
        {[
          { label: 'Strong', count: counts.strong, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Weak', count: counts.weak, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Missing', count: counts.missing, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={`glass-card p-4 text-center`}
          >
            <div className={`text-3xl font-display font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        {radarData.length >= 3 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Skill Coverage Radar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#2A2D35" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Your Skills" dataKey="current" stroke="#D4A017" fill="#D4A017" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Required" dataKey="required" stroke="#F87171" fill="#F87171" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-0.5 bg-gold-500 rounded" /> Your Skills
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-0.5 bg-red-400 rounded border-dashed" /> Required
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Skill Gap Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212, 160, 23, 0.05)' }} />
              <Bar dataKey="current" radius={[0, 4, 4, 0]} barSize={14}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
