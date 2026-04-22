import { useState } from "react";
import {
  Activity,
  User,
  BookOpen,
  ShoppingCart,
  Shield,
  FileText,
  Settings,
  Search,
} from "lucide-react";

/* ─── types ──────────────────────────────────────────────── */
type LogType = "user" | "guide" | "purchase" | "admin" | "blog" | "system";

interface LogEntry {
  id: number;
  type: LogType;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  ip: string;
}

/* ─── icon / color maps ──────────────────────────────────── */
const TYPE_ICONS: Record<LogType, React.ElementType> = {
  user: User,
  guide: BookOpen,
  purchase: ShoppingCart,
  admin: Shield,
  blog: FileText,
  system: Settings,
};

const TYPE_COLORS: Record<LogType, string> = {
  user: "bg-blue-100 text-blue-700",
  guide: "bg-purple-100 text-purple-700",
  purchase: "bg-emerald-100 text-emerald-700",
  admin: "bg-orange-100 text-orange-700",
  blog: "bg-pink-100 text-pink-700",
  system: "bg-slate-100 text-slate-600",
};

/* ─── mock data ──────────────────────────────────────────── */
const INIT_LOGS: LogEntry[] = [
  { id: 1,  type: "user",     action: "User signed up",            actor: "maria@email.com",  target: "Maria Santos",                      timestamp: "2025-04-22 14:32:05", ip: "203.177.x.x" },
  { id: 2,  type: "purchase", action: "Guide purchased",           actor: "juan@email.com",   target: "8% vs Graduated Tax (₱89)",          timestamp: "2025-04-22 13:11:44", ip: "203.177.x.x" },
  { id: 3,  type: "admin",    action: "Guide published",           actor: "admin@asikaso.ph", target: "PhilHealth Membership Registration", timestamp: "2025-04-22 11:05:22", ip: "192.168.x.x" },
  { id: 4,  type: "system",   action: "Maintenance mode enabled",  actor: "admin@asikaso.ph", target: "App Settings",                      timestamp: "2025-04-22 09:00:00", ip: "192.168.x.x" },
  { id: 5,  type: "user",     action: "User banned",               actor: "admin@asikaso.ph", target: "spam@bot.net",                      timestamp: "2025-04-21 18:44:10", ip: "192.168.x.x" },
  { id: 6,  type: "guide",    action: "Guide created",             actor: "admin@asikaso.ph", target: "How to Open a Savings Account",     timestamp: "2025-04-21 16:20:33", ip: "192.168.x.x" },
  { id: 7,  type: "purchase", action: "Guide purchased",           actor: "pedro@email.com",  target: "First Job Ready Bundle (₱299)",      timestamp: "2025-04-21 14:55:01", ip: "203.178.x.x" },
  { id: 8,  type: "blog",     action: "Blog post published",       actor: "admin@asikaso.ph", target: "PhilHealth Contribution Table 2025", timestamp: "2025-04-21 10:30:00", ip: "192.168.x.x" },
  { id: 9,  type: "system",   action: "Maintenance mode disabled", actor: "admin@asikaso.ph", target: "App Settings",                      timestamp: "2025-04-21 09:15:00", ip: "192.168.x.x" },
  { id: 10, type: "user",     action: "User signed up",            actor: "carlo@email.com",  target: "Carlo Mendoza",                     timestamp: "2025-04-20 20:02:40", ip: "203.175.x.x" },
  { id: 11, type: "guide",    action: "Guide step added",          actor: "admin@asikaso.ph", target: "How to Get a Passport — Step 3",    timestamp: "2025-04-20 15:44:12", ip: "192.168.x.x" },
  { id: 12, type: "purchase", action: "Refund issued",             actor: "admin@asikaso.ph", target: "SSS Online Registration (₱89)",      timestamp: "2025-04-20 11:10:05", ip: "192.168.x.x" },
];

const ALL_TYPES: Array<"all" | LogType> = [
  "all", "user", "guide", "purchase", "admin", "blog", "system",
];

/* ─── component ──────────────────────────────────────────── */
export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | LogType>("all");

  const filtered = INIT_LOGS.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || l.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 flex-wrap">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                typeFilter === t
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {filtered.length} Entries
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Type", "Action", "Actor", "Target", "Timestamp", "IP"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((log) => {
              const Icon = TYPE_ICONS[log.type];
              return (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[log.type]}`}>
                      <Icon size={14} />
                      {log.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-800">{log.action}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{log.actor}</td>
                  <td className="px-5 py-3 text-xs text-slate-600 max-w-[200px]">
                    <p className="truncate">{log.target}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 font-mono">{log.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
