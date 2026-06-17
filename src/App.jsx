import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import {
  Plus, Trash2, CheckCircle2, Circle, Target, TrendingUp,
  ChevronDown, ChevronUp, Sparkles, Award, BarChart2, X
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'goal_impact_dashboard_v1';

const GOAL_COLORS = [
  { bg: 'from-violet-500 to-purple-600', ring: '#8b5cf6', light: 'bg-violet-50', text: 'text-violet-600' },
  { bg: 'from-blue-500 to-cyan-600',    ring: '#3b82f6', light: 'bg-blue-50',   text: 'text-blue-600'   },
  { bg: 'from-emerald-500 to-teal-600', ring: '#10b981', light: 'bg-emerald-50',text: 'text-emerald-600'},
  { bg: 'from-rose-500 to-pink-600',    ring: '#f43f5e', light: 'bg-rose-50',   text: 'text-rose-600'   },
  { bg: 'from-amber-500 to-orange-600', ring: '#f59e0b', light: 'bg-amber-50',  text: 'text-amber-600'  },
];

const WEEKDAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function calcGoalProgress(goal) {
  if (!goal.subtasks.length) return 0;
  const done = goal.subtasks.filter(s => s.done).length;
  return Math.round((done / goal.subtasks.length) * 100);
}

function buildBarData(goals) {
  return WEEKDAYS.map((day, i) => ({
    day,
    completed: goals.reduce((acc, g) =>
      acc + g.subtasks.filter(s => s.done && s.completedDay === i).length, 0),
  }));
}

function getGlobalProgress(goals) {
  const total = goals.reduce((a, g) => a + g.subtasks.length, 0);
  const done  = goals.reduce((a, g) => a + g.subtasks.filter(s => s.done).length, 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeUp  = { hidden: { opacity: 0, y: 24 },   show: { opacity: 1, y: 0 } };
const scaleIn = { hidden: { opacity: 0, scale: .85 }, show: { opacity: 1, scale: 1 } };
const slideIn = { hidden: { opacity: 0, x: 30 },   show: { opacity: 1, x: 0 } };

// ─── Sub-components ──────────────────────────────────────────────────────────

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-3xl backdrop-blur-md bg-white/70 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function RadialProgress({ value, size = 160 }) {
  const r    = 58;
  const circ = 2 * Math.PI * r;
  const dash = circ * (value / 100);

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <motion.circle
        cx="70" cy="70" r={r} fill="none"
        stroke="#8b5cf6" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show"
      transition={{ delay, duration: .5 }}
      whileHover={{ y: -4, transition: { duration: .2 } }}
    >
      <GlassCard className="p-5 h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${color} shadow-md`}>
            <Icon size={20} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-500">{label}</span>
        </div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </GlassCard>
    </motion.div>
  );
}

function GlobalProgressWidget({ goals }) {
  const pct   = getGlobalProgress(goals);
  const total = goals.reduce((a, g) => a + g.subtasks.length, 0);
  const done  = goals.reduce((a, g) => a + g.subtasks.filter(s => s.done).length, 0);

  return (
    <GlassCard className="p-6 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 mb-1 self-start">
        <Target size={18} className="text-violet-500" />
        <h3 className="font-bold text-slate-700 text-base">التقدم العالمي</h3>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        <RadialProgress value={pct} size={160} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={pct}
            initial={{ scale: .7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-slate-800"
          >
            {pct}%
          </motion.span>
          <span className="text-xs text-slate-400 font-medium">مكتمل</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-3 mt-1">
        <div className="rounded-2xl bg-violet-50 p-3 text-center">
          <p className="text-2xl font-bold text-violet-600">{done}</p>
          <p className="text-xs text-slate-500">منجز</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-center">
          <p className="text-2xl font-bold text-slate-600">{total - done}</p>
          <p className="text-xs text-slate-500">متبقي</p>
        </div>
      </div>
    </GlassCard>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-3 text-sm text-right">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill ?? '#8b5cf6' }} className="font-medium">
          مكتمل: {p.value}
        </p>
      ))}
    </div>
  );
}

function WeeklyBarChart({ goals }) {
  const data    = buildBarData(goals);
  const todayIdx = new Date().getDay();

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={18} className="text-blue-500" />
        <h3 className="font-bold text-slate-700 text-base">إنجاز المهام أسبوعياً</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,.1)' }} />
          <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === todayIdx ? '#8b5cf6' : '#c4b5fd'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

function SubtaskItem({ subtask, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-2 group py-1"
    >
      <motion.button whileTap={{ scale: .85 }} onClick={onToggle}
        className="flex-shrink-0 text-slate-400 hover:text-violet-500 transition-colors">
        {subtask.done
          ? <CheckCircle2 size={18} className="text-violet-500" />
          : <Circle size={18} />}
      </motion.button>
      <span className={`flex-1 text-sm ${subtask.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
        {subtask.text}
      </span>
      <motion.button whileTap={{ scale: .8 }} onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-400">
        <X size={14} />
      </motion.button>
    </motion.div>
  );
}

function GoalCard({ goal, colorMeta, onDelete, onToggleSubtask, onDeleteSubtask, onAddSubtask }) {
  const [expanded, setExpanded] = useState(true);
  const [newSub,   setNewSub]   = useState('');
  const progress = calcGoalProgress(goal);

  const handleAddSub = () => {
    if (!newSub.trim()) return;
    onAddSubtask(goal.id, newSub.trim());
    setNewSub('');
  };

  return (
    <motion.div
      layout
      variants={slideIn}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: .9, transition: { duration: .2 } }}
      whileHover={{ y: -2, transition: { duration: .15 } }}
    >
      <GlassCard className="overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${colorMeta.bg}`} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-base leading-snug truncate">{goal.title}</h3>
              {goal.description && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{goal.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.button whileTap={{ scale: .8 }} onClick={() => setExpanded(v => !v)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </motion.button>
              <motion.button whileTap={{ scale: .8 }} onClick={() => onDelete(goal.id)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500 font-medium">
                {goal.subtasks.filter(s => s.done).length}/{goal.subtasks.length} مهمة
              </span>
              <motion.span key={progress} initial={{ scale: .8 }} animate={{ scale: 1 }}
                className={`text-xs font-bold ${colorMeta.text}`}>
                {progress}%
              </motion.span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${colorMeta.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: .8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Subtasks */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: .25 }}
              >
                <div className="space-y-0.5 mb-3 min-h-[2rem]">
                  <AnimatePresence>
                    {goal.subtasks.length === 0 && (
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-xs text-slate-300 text-center py-3"
                      >
                        لا توجد مهام بعد
                      </motion.p>
                    )}
                    {goal.subtasks.map(sub => (
                      <SubtaskItem
                        key={sub.id}
                        subtask={sub}
                        onToggle={() => onToggleSubtask(goal.id, sub.id)}
                        onDelete={() => onDeleteSubtask(goal.id, sub.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <div className={`flex items-center gap-2 rounded-xl p-2 ${colorMeta.light}`}>
                  <input
                    value={newSub}
                    onChange={e => setNewSub(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSub()}
                    placeholder="أضف مهمة فرعية..."
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none text-right"
                  />
                  <motion.button whileTap={{ scale: .85 }} onClick={handleAddSub}
                    className={`p-1.5 rounded-lg bg-gradient-to-br ${colorMeta.bg} text-white shadow-sm`}>
                    <Plus size={14} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function AddGoalModal({ onClose, onAdd }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: description.trim() });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: .85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles size={20} className="text-violet-500" />
              هدف جديد
            </h2>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">عنوان الهدف *</label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="ما الهدف الذي تريد تحقيقه؟"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">وصف (اختياري)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="وصف مختصر للهدف..."
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              whileTap={{ scale: .95 }}
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-shadow"
            >
              إضافة الهدف
            </motion.button>
            <motion.button
              whileTap={{ scale: .95 }}
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const addGoal = useCallback(({ title, description }) => {
    setGoals(prev => [{
      id: uid(), title, description, subtasks: [],
      colorIdx: prev.length % GOAL_COLORS.length,
      createdAt: Date.now(),
    }, ...prev]);
  }, []);

  const deleteGoal = useCallback(id => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const addSubtask = useCallback((goalId, text) => {
    setGoals(prev => prev.map(g => g.id !== goalId ? g : {
      ...g, subtasks: [...g.subtasks, { id: uid(), text, done: false }],
    }));
  }, []);

  const toggleSubtask = useCallback((goalId, subId) => {
    const today = new Date().getDay();
    setGoals(prev => prev.map(g => g.id !== goalId ? g : {
      ...g, subtasks: g.subtasks.map(s => s.id !== subId ? s : {
        ...s, done: !s.done, completedDay: !s.done ? today : undefined,
      }),
    }));
  }, []);

  const deleteSubtask = useCallback((goalId, subId) => {
    setGoals(prev => prev.map(g => g.id !== goalId ? g : {
      ...g, subtasks: g.subtasks.filter(s => s.id !== subId),
    }));
  }, []);

  const globalPct  = getGlobalProgress(goals);
  const totalGoals = goals.length;
  const doneGoals  = goals.filter(g => calcGoalProgress(g) === 100).length;
  const doneTasks  = goals.reduce((a, g) => a + g.subtasks.filter(s => s.done).length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-100 p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%]  w-80 h-80 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.header
          variants={fadeUp} initial="hidden" animate="show"
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              لوحة تأثير{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                الأهداف
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              تتبع أهدافك وقس تأثيرها الحقيقي
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: .95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-shadow"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">هدف جديد</span>
          </motion.button>
        </motion.header>

        {/* ── Dashboard Summary ── */}
        <section className="mb-8">
          <motion.h2
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .05 }}
            className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
          >
            ملخص الأداء
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Target}       label="إجمالي الأهداف" value={totalGoals}        color="from-violet-500 to-purple-600" delay={.08} />
            <StatCard icon={Award}        label="أهداف مكتملة"   value={doneGoals}         color="from-emerald-500 to-teal-600"  delay={.12} />
            <StatCard icon={CheckCircle2} label="مهام منجزة"     value={doneTasks}         color="from-blue-500 to-cyan-600"     delay={.16} />
            <StatCard icon={TrendingUp}   label="نسبة الإنجاز"   value={`${globalPct}%`}   color="from-amber-500 to-orange-600"  delay={.20} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div variants={scaleIn} initial="hidden" animate="show" transition={{ delay: .25 }}>
              <GlobalProgressWidget goals={goals} />
            </motion.div>
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .3 }}
              className="md:col-span-2"
            >
              <WeeklyBarChart goals={goals} />
            </motion.div>
          </div>
        </section>

        {/* ── Goals List ── */}
        <section>
          <motion.h2
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: .35 }}
            className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
          >
            قائمة الأهداف ({totalGoals})
          </motion.h2>

          <LayoutGroup>
            <AnimatePresence>
              {goals.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <GlassCard className="p-16 flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <Target size={36} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-700 mb-1">ابدأ رحلتك!</p>
                      <p className="text-slate-400 text-sm">أضف هدفك الأول وابدأ في تتبع تقدمك</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: .95 }}
                      onClick={() => setShowModal(true)}
                      className="mt-2 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-200"
                    >
                      <Plus size={16} />
                      أضف أول هدف
                    </motion.button>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {goals.map((goal, idx) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    colorMeta={GOAL_COLORS[goal.colorIdx ?? idx % GOAL_COLORS.length]}
                    onDelete={deleteGoal}
                    onToggleSubtask={toggleSubtask}
                    onDeleteSubtask={deleteSubtask}
                    onAddSubtask={addSubtask}
                  />
                ))}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </section>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <AddGoalModal onClose={() => setShowModal(false)} onAdd={addGoal} />
        )}
      </AnimatePresence>
    </div>
  );
}
