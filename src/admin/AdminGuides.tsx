import { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff,
  ChevronDown, ChevronUp, BookOpen, DollarSign,
  GripVertical, Check, X, Tag,
} from 'lucide-react';

/* ─────── types ─────── */
interface Step {
  id: number;
  title: string;
  description: string;
}

interface Guide {
  id: number;
  title: string;
  category: string;
  price: number;
  steps: Step[];
  published: boolean;
  sales: number;
  createdAt: string;
}

/* ─────── mock data ─────── */
const CATEGORIES = ['Government', 'Finance', 'Travel', 'Healthcare', 'Tax', 'Career', 'Housing'];

const INIT_GUIDES: Guide[] = [
  {
    id: 1, title: '8% vs Graduated Tax: Which Saves You More?',
    category: 'Tax', price: 89, published: true, sales: 842, createdAt: '2025-01-10',
    steps: [
      { id: 1, title: 'Understand the two tax types', description: 'Learn the difference.' },
      { id: 2, title: 'Calculate your gross income',  description: 'Determine your annual gross.' },
      { id: 3, title: 'Compare net income',            description: 'Use the calculator.' },
    ],
  },
  {
    id: 2, title: 'How to Get a Philippine Passport',
    category: 'Travel', price: 89, published: true, sales: 651, createdAt: '2025-01-15',
    steps: [
      { id: 1, title: 'Book a DFA appointment', description: 'Use the DFA online portal.' },
      { id: 2, title: 'Prepare requirements',   description: 'PSA birth certificate, valid ID, etc.' },
    ],
  },
  {
    id: 3, title: 'PhilHealth Membership Registration',
    category: 'Government', price: 89, published: true, sales: 490, createdAt: '2025-02-01',
    steps: [{ id: 1, title: 'Fill the PMRF form', description: 'Available online or at any PhilHealth branch.' }],
  },
  {
    id: 4, title: 'How to Open a Savings Account',
    category: 'Finance', price: 89, published: false, sales: 0, createdAt: '2025-04-01',
    steps: [],
  },
];

/* ─────── small components ─────── */
function StatusBadge({ published }: { published: boolean }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
      published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
    }`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

/* ─────── Guide Editor Modal ─────── */
function GuideModal({
  guide, onSave, onClose,
}: {
  guide: Partial<Guide> | null;
  onSave: (g: Guide) => void;
  onClose: () => void;
}) {
  const isNew = !guide?.id;
  const [title, setTitle]       = useState(guide?.title ?? '');
  const [category, setCategory] = useState(guide?.category ?? CATEGORIES[0]);
  const [price, setPrice]       = useState(guide?.price ?? 89);
  const [published, setPublished] = useState(guide?.published ?? false);
  const [steps, setSteps]       = useState<Step[]>(guide?.steps ?? []);
  const [newStep, setNewStep]   = useState('');

  const addStep = () => {
    if (!newStep.trim()) return;
    setSteps(prev => [...prev, { id: Date.now(), title: newStep.trim(), description: '' }]);
    setNewStep('');
  };

  const removeStep = (id: number) => setSteps(prev => prev.filter(s => s.id !== id));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: guide?.id ?? Date.now(),
      title: title.trim(),
      category, price, published, steps,
      sales: guide?.sales ?? 0,
      createdAt: guide?.createdAt ?? new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{isNew ? 'Create New Guide' : 'Edit Guide'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Title *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. How to Get Your TIN"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Price */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Price (₱)</label>
              <input
                type="number" value={price} onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Steps ({steps.length})</label>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                  <span className="text-xs font-bold text-blue-600 w-5 flex-shrink-0">{i + 1}</span>
                  <p className="flex-1 text-sm text-slate-700 truncate">{step.title}</p>
                  <button onClick={() => removeStep(step.id)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={newStep} onChange={e => setNewStep(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStep()}
                placeholder="Add a step title..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button onClick={addStep} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Published</p>
              <p className="text-xs text-slate-400">Visible to users on the platform</p>
            </div>
            <button
              onClick={() => setPublished(!published)}
              className={`w-11 h-6 rounded-full transition-colors relative ${published ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${published ? '' : ''}`}
                style={{ left: published ? '22px' : '2px' }} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
            {isNew ? 'Create Guide' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}

/* ─────── main component ─────── */
export default function AdminGuides() {
  const [guides, setGuides] = useState<Guide[]>(INIT_GUIDES);
  const [search, setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modal, setModal] = useState<Partial<Guide> | null | false>(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = guides.filter(g => {
    const matchSearch  = g.title.toLowerCase().includes(search.toLowerCase());
    const matchCat     = catFilter === 'All' || g.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (g: Guide) => {
    setGuides(prev => {
      const exists = prev.find(x => x.id === g.id);
      if (exists) return prev.map(x => x.id === g.id ? g : x);
      return [...prev, g];
    });
    setModal(false);
  };

  const togglePublish = (id: number) => {
    setGuides(prev => prev.map(g => g.id === id ? { ...g, published: !g.published } : g));
  };

  const deleteGuide = (id: number) => {
    if (confirm('Delete this guide?')) setGuides(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search guides..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <select
          value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none"
        >
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} /> New Guide
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">{guides.length} Total</span>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">{guides.filter(g => g.published).length} Published</span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">{guides.filter(g => !g.published).length} Drafts</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Title', 'Category', 'Price', 'Steps', 'Sales', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(guide => (
              <>
                <tr key={guide.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setExpandedId(expandedId === guide.id ? null : guide.id)} className="text-slate-400 hover:text-blue-600">
                        {expandedId === guide.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <div>
                        <p className="font-semibold text-sm text-slate-800 max-w-[220px] truncate">{guide.title}</p>
                        <p className="text-[10px] text-slate-400">{guide.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                      <Tag size={10} /> {guide.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-800">₱{guide.price}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{guide.steps.length}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-700">{guide.sales.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge published={guide.published} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePublish(guide.id)} title={guide.published ? 'Unpublish' : 'Publish'}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                        {guide.published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => setModal(guide)} title="Edit"
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => deleteGuide(guide.id)} title="Delete"
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === guide.id && (
                  <tr key={`${guide.id}-steps`} className="bg-slate-50/60">
                    <td colSpan={7} className="px-8 py-3">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Steps</p>
                      {guide.steps.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No steps added yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {guide.steps.map((s, i) => (
                            <span key={s.id} className="flex items-center gap-1.5 bg-white border border-slate-200 text-xs text-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                              <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0">{i + 1}</span>
                              {s.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No guides found</p>
          </div>
        )}
      </div>

      {modal !== false && (
        <GuideModal guide={modal} onSave={handleSave} onClose={() => setModal(false)} />
      )}
    </div>
  );
}
