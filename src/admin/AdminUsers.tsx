import { useState } from 'react';
import {
  Search, Ban, CheckCircle, Eye, MoreHorizontal,
  Shield, Mail, Calendar, ShoppingBag, Filter,
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  plan: 'free' | 'paid';
  purchases: number;
  spent: string;
  joinedAt: string;
  lastActive: string;
  banned: boolean;
  role: 'user' | 'admin';
}

const INIT_USERS: User[] = [
  { id: 1,  name: 'Juan dela Cruz',    email: 'juan@email.com',    plan: 'paid', purchases: 5,  spent: '₱445',  joinedAt: '2025-01-05', lastActive: '2025-04-22', banned: false, role: 'user' },
  { id: 2,  name: 'Maria Santos',      email: 'maria@email.com',   plan: 'paid', purchases: 3,  spent: '₱267',  joinedAt: '2025-01-12', lastActive: '2025-04-21', banned: false, role: 'user' },
  { id: 3,  name: 'Pedro Reyes',       email: 'pedro@email.com',   plan: 'paid', purchases: 7,  spent: '₱623',  joinedAt: '2025-02-01', lastActive: '2025-04-20', banned: false, role: 'user' },
  { id: 4,  name: 'Ana Gomez',         email: 'ana@email.com',     plan: 'free', purchases: 0,  spent: '₱0',    joinedAt: '2025-02-14', lastActive: '2025-04-18', banned: false, role: 'user' },
  { id: 5,  name: 'Carlo Mendoza',     email: 'carlo@email.com',   plan: 'paid', purchases: 2,  spent: '₱178',  joinedAt: '2025-03-01', lastActive: '2025-04-15', banned: false, role: 'user' },
  { id: 6,  name: 'Spam Bot 9000',     email: 'spam@bot.net',      plan: 'free', purchases: 0,  spent: '₱0',    joinedAt: '2025-03-15', lastActive: '2025-03-16', banned: true,  role: 'user' },
  { id: 7,  name: 'Rich Constante',    email: 'rc@asikaso.ph',     plan: 'paid', purchases: 12, spent: '₱1,068',joinedAt: '2025-01-01', lastActive: '2025-04-22', banned: false, role: 'admin' },
  { id: 8,  name: 'Liza Vergara',      email: 'liza@email.com',    plan: 'free', purchases: 1,  spent: '₱89',   joinedAt: '2025-04-10', lastActive: '2025-04-21', banned: false, role: 'user' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(INIT_USERS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'banned' | 'paid' | 'free'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    if (filter === 'banned') return matchSearch && u.banned;
    if (filter === 'paid')   return matchSearch && u.plan === 'paid' && !u.banned;
    if (filter === 'free')   return matchSearch && u.plan === 'free' && !u.banned;
    return matchSearch;
  });

  const toggleBan = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, banned: !u.banned } : u));
    if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, banned: !prev.banned } : null);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {(['all', 'paid', 'free', 'banned'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">{users.length} Total</span>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">{users.filter(u => u.plan === 'paid').length} Paid</span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">{users.filter(u => u.plan === 'free').length} Free</span>
        <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{users.filter(u => u.banned).length} Banned</span>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 min-w-0 ${selectedUser ? '' : 'xl:flex-none xl:w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['User', 'Plan', 'Purchases', 'Joined', 'Last Active', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50/50' : ''} ${user.banned ? 'opacity-60' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          user.banned ? 'bg-red-100 text-red-600' :
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        user.plan === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>{user.plan}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{user.purchases}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{user.joinedAt}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{user.lastActive}</td>
                    <td className="px-5 py-3">
                      {user.role === 'admin'
                        ? <span className="flex items-center gap-1 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full font-bold"><Shield size={10} /> Admin</span>
                        : <span className="text-xs text-slate-500">User</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      {user.banned
                        ? <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Banned</span>
                        : <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Active</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); toggleBan(user.id); }}
                        title={user.banned ? 'Unban' : 'Ban'}
                        className={`p-2 rounded-lg transition-colors ${
                          user.banned
                            ? 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                            : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                        }`}
                      >
                        {user.banned ? <CheckCircle size={15} /> : <Ban size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="font-semibold">No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit animate-slide-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600"><span className="text-lg">×</span></button>
            </div>
            <div className="flex flex-col items-center mb-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${
                selectedUser.banned ? 'bg-red-100 text-red-600' :
                selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              }`}>{selectedUser.name.charAt(0)}</div>
              <p className="font-bold text-slate-800">{selectedUser.name}</p>
              <p className="text-xs text-slate-400">{selectedUser.email}</p>
              {selectedUser.banned && <span className="mt-2 text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Banned</span>}
            </div>

            <div className="space-y-3 mb-5">
              {[
                { icon: <Mail size={14} className="text-slate-400" />, label: 'Plan', val: selectedUser.plan.toUpperCase() },
                { icon: <ShoppingBag size={14} className="text-slate-400" />, label: 'Purchases', val: `${selectedUser.purchases} guides` },
                { icon: <ShoppingBag size={14} className="text-slate-400" />, label: 'Total Spent', val: selectedUser.spent },
                { icon: <Calendar size={14} className="text-slate-400" />, label: 'Joined', val: selectedUser.joinedAt },
                { icon: <Calendar size={14} className="text-slate-400" />, label: 'Last Active', val: selectedUser.lastActive },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-slate-500">{item.icon} {item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => toggleBan(selectedUser.id)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                selectedUser.banned
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {selectedUser.banned ? 'Unban User' : 'Ban User'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}
