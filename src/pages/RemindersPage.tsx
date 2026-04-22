import { useState } from 'react';
import {
  Bell, Plus, Calendar, Trash2, Check, Clock, X,
} from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';

/* ─────────────────────────── types ─────────────────────────── */

interface Reminder {
  id: number;
  title: string;
  date: string;
  time: string;
  done: boolean;
}

/* ─────────────────────────── component ─────────────────────────── */

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    setReminders(prev => [
      ...prev,
      {
        id: Date.now(),
        title: newTitle.trim(),
        date: newDate,
        time: newTime || '09:00',
        done: false,
      },
    ]);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setShowModal(false);
  };

  const toggleDone = (id: number) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const deleteReminder = (id: number) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const pending = reminders.filter(r => !r.done);
  const completed = reminders.filter(r => r.done);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <DashboardHeader />

      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Bell size={28} className="text-blue-600" />
            <h1 className="text-3xl font-extrabold text-slate-900">Reminders</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={16} /> Add Reminder
          </button>
        </div>

        {/* Empty State */}
        {reminders.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell size={36} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No reminders yet</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
              Stay on top of bills, appointments, and deadlines.<br />Add your first reminder below!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md"
            >
              + Add Reminder
            </button>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Upcoming</h2>
            <div className="space-y-3">
              {pending.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <button
                    onClick={() => toggleDone(r.id)}
                    className="w-8 h-8 rounded-full border-2 border-blue-400 flex items-center justify-center flex-shrink-0 hover:bg-blue-50 transition-colors"
                  >
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Calendar size={12} /> {r.date} &nbsp;•&nbsp; <Clock size={12} /> {r.time}</p>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Completed</h2>
            <div className="space-y-3">
              {completed.map(r => (
                <div key={r.id} className="bg-white/60 rounded-xl border border-slate-100 p-4 flex items-center gap-4 opacity-60 transition-all">
                  <button
                    onClick={() => toggleDone(r.id)}
                    className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                  >
                    <Check size={14} className="text-white" />
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-600 line-through">{r.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Calendar size={12} /> {r.date}</p>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Google Calendar */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">GOOGLE CALENDAR</p>
          <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 text-sm">Connect Google Calendar</p>
              <p className="text-xs text-slate-500">Sync reminders to your Google Calendar</p>
            </div>
            <button className="text-blue-600 font-semibold text-sm hover:underline">Connect →</button>
          </div>
        </div>
      </div>

      {/* ══════════ ADD MODAL ══════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Add Reminder</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Pay electric bill"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}
