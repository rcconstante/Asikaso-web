import {
  Users,
  BookOpen,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Star,
} from "lucide-react";

/* ─── mock data ──────────────────────────────────────────── */
const STATS = [
  {
    label: "Total Users",
    value: "1,284",
    change: "+12%",
    up: true,
    icon: Users,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Total Revenue",
    value: "₱98,560",
    change: "+8%",
    up: true,
    icon: DollarSign,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Guides Sold",
    value: "3,421",
    change: "+21%",
    up: true,
    icon: ShoppingCart,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    label: "Active Guides",
    value: "47",
    change: "-2",
    up: false,
    icon: BookOpen,
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

const RECENT_ORDERS = [
  {
    user: "Juan dela Cruz",
    email: "juan@email.com",
    guide: "8% vs Graduated Tax",
    amount: "₱89",
    date: "2025-04-22",
    status: "paid" as const,
  },
  {
    user: "Maria Santos",
    email: "maria@email.com",
    guide: "How to Get a Passport",
    amount: "₱89",
    date: "2025-04-22",
    status: "paid" as const,
  },
  {
    user: "Pedro Reyes",
    email: "pedro@email.com",
    guide: "PhilHealth Registration",
    amount: "₱89",
    date: "2025-04-21",
    status: "paid" as const,
  },
  {
    user: "Ana Gomez",
    email: "ana@email.com",
    guide: "SSS Online Registration",
    amount: "₱89",
    date: "2025-04-21",
    status: "refunded" as const,
  },
  {
    user: "Carlo Mendoza",
    email: "carlo@email.com",
    guide: "First Job Ready Bundle",
    amount: "₱299",
    date: "2025-04-20",
    status: "paid" as const,
  },
];

const TOP_GUIDES = [
  { title: "8% vs Graduated Tax", sales: 842, revenue: "₱74,938", rating: 4.9 },
  { title: "How to Get a Passport", sales: 651, revenue: "₱57,939", rating: 4.8 },
  { title: "PhilHealth Registration", sales: 490, revenue: "₱43,610", rating: 4.7 },
  { title: "SSS Online Registration", sales: 380, revenue: "₱33,820", rating: 4.8 },
  { title: "First Job Ready Bundle", sales: 310, revenue: "₱92,890", rating: 4.9 },
];

const REVENUE_BARS = [40, 65, 55, 80, 70, 90, 75, 95, 85, 100, 88, 92];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ─── component ──────────────────────────────────────────── */
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center ${s.iconColor}`}>
                  <Icon size={22} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                  s.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.change}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800">Monthly Revenue</h2>
              <p className="text-xs text-slate-400 mt-0.5">₱98,560 total this year</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp size={12} /> +24% YoY
            </span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {REVENUE_BARS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer relative group"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    ₱{Math.round(h * 1000).toLocaleString()}
                  </div>
                </div>
                <span className="text-[9px] text-slate-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Guides */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Top Guides</h2>
          <div className="space-y-3">
            {TOP_GUIDES.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : i === 1
                    ? "bg-slate-100 text-slate-600"
                    : i === 2
                    ? "bg-orange-100 text-orange-600"
                    : "bg-slate-50 text-slate-400"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{g.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {g.sales} sales • {g.revenue}
                  </p>
                </div>
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-bold flex-shrink-0">
                  <Star size={10} fill="currentColor" /> {g.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Purchases</h2>
          <button className="text-xs text-blue-600 font-semibold hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {["User", "Guide", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {RECENT_ORDERS.map((o, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="text-sm font-semibold text-slate-800">{o.user}</p>
                    <p className="text-xs text-slate-400">{o.email}</p>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600 max-w-[200px]">
                    <p className="truncate">{o.guide}</p>
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-slate-800">{o.amount}</td>
                  <td className="px-6 py-3 text-xs text-slate-400">{o.date}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      o.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
