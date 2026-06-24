import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ── Dummy Data ──────────────────────────────────────────────────────────────

const timeRanges = ["Week", "Month", "Season", "Year"] as const;
type TimeRange = (typeof timeRanges)[number];

const allStats: Record<TimeRange, { totalFilms: number; totalViews: number; averageRating: number; activeFilms: number; deltas: { films: string; views: string; rating: string; active: string } }> = {
  Week: {
    totalFilms: 24,
    totalViews: 3210,
    averageRating: 8.2,
    activeFilms: 20,
    deltas: { films: "+2", views: "+18.3%", rating: "+0.3", active: "+1" },
  },
  Month: {
    totalFilms: 24,
    totalViews: 12547,
    averageRating: 8.2,
    activeFilms: 20,
    deltas: { films: "+5", views: "+24.1%", rating: "+0.1", active: "+3" },
  },
  Season: {
    totalFilms: 24,
    totalViews: 38420,
    averageRating: 8.1,
    activeFilms: 19,
    deltas: { films: "+12", views: "+31.7%", rating: "-0.2", active: "+8" },
  },
  Year: {
    totalFilms: 24,
    totalViews: 142000,
    averageRating: 8.0,
    activeFilms: 18,
    deltas: { films: "+24", views: "+100%", rating: "+0.5", active: "+18" },
  },
};

const recentFilms = [
  { id: 1, title: "Oppenheimer", year: 2023, rating: 8.5, added: "2 hours ago" },
  { id: 2, title: "Dune: Part Two", year: 2024, rating: 8.8, added: "5 hours ago" },
  { id: 3, title: "The Batman", year: 2022, rating: 7.8, added: "1 day ago" },
  {
    id: 4,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    rating: 8.7,
    added: "2 days ago",
  },
  { id: 5, title: "John Wick: Chapter 4", year: 2023, rating: 7.7, added: "3 days ago" },
];

const mostWatched = [
  { id: 1, title: "Interstellar", views: 2340 },
  { id: 2, title: "Inception", views: 1890 },
  { id: 3, title: "The Dark Knight", views: 1654 },
  { id: 4, title: "Oppenheimer", views: 1420 },
  { id: 5, title: "Dune: Part Two", views: 1180 },
];

const genreDistribution = [
  { genre: "Action", count: 8, color: "#f43f5e" },
  { genre: "Drama", count: 6, color: "#8b5cf6" },
  { genre: "Sci-Fi", count: 5, color: "#06b6d4" },
  { genre: "Thriller", count: 4, color: "#f97316" },
  { genre: "Comedy", count: 3, color: "#22c55e" },
];

const topRated = [
  { id: 1, title: "The Shawshank Redemption", year: 1994, rating: 9.3 },
  { id: 2, title: "The Godfather", year: 1972, rating: 9.2 },
  { id: 3, title: "The Dark Knight", year: 2008, rating: 9.0 },
  { id: 4, title: "Schindler's List", year: 1993, rating: 8.9 },
  { id: 5, title: "Inception", year: 2010, rating: 8.8 },
];

const maxViews = Math.max(...mostWatched.map((f) => f.views));

// ── Icon Components ─────────────────────────────────────────────────────────

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function StarIcon({ className, filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating / 2);
  const hasHalf = rating % 2 >= 1;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<StarIcon key={i} filled className="h-4 w-4 text-amber-400" />);
    } else if (i === full && hasHalf) {
      stars.push(
        <span key={i} className="relative inline-block h-4 w-4">
          <StarIcon className="absolute inset-0 h-4 w-4 text-slate-300 dark:text-slate-500" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <StarIcon filled className="h-4 w-4 text-amber-400" />
          </span>
        </span>
      );
    } else {
      stars.push(<StarIcon key={i} className="h-4 w-4 text-slate-300 dark:text-slate-500" />);
    }
  }

  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

// ── Custom Recharts Tooltip ─────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { genre: string; count: number; color: string } }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{data.genre}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{data.count} films</p>
      </div>
    );
  }
  return null;
}

// ── Glass Card ──────────────────────────────────────────────────────────────

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white/60 shadow-xl backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/40 ${className}`}>
      {children}
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon, iconBg, accentBorder, gradientFrom, value, label, delta }: {
  icon: React.ReactNode;
  iconBg: string;
  accentBorder: string;
  gradientFrom: string;
  value: string;
  label: string;
  delta: string;
}) {
  const isPositive = delta.startsWith("+");
  return (
    <GlassCard className={`relative overflow-hidden bg-gradient-to-br ${gradientFrom} to-slate-50 dark:to-slate-900`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${accentBorder}`} />
      <div className="flex items-center gap-4 p-5 pl-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <span className={`text-xs font-medium ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {delta}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeRange, setActiveRange] = useState<TimeRange>("Month");
  const stats = useMemo(() => allStats[activeRange], [activeRange]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      {/* ── Top: Welcome + Time Filter ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, Admin</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dateStr}</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/60 p-1 backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/60" role="radiogroup" aria-label="Time range filter">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant="ghost"
              size="sm"
              role="radio"
              aria-checked={activeRange === range}
              onClick={() => setActiveRange(range)}
              className={activeRange === range ? "bg-slate-900/10 text-slate-900 shadow-sm dark:bg-white/10 dark:text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FilmIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-100 dark:bg-emerald-500/10"
          accentBorder="bg-emerald-500"
          gradientFrom="from-emerald-500/10 dark:from-emerald-500/5"
          value={String(stats.totalFilms)}
          label="Total Films"
          delta={stats.deltas.films}
        />
        <StatCard
          icon={<EyeIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />}
          iconBg="bg-cyan-100 dark:bg-cyan-500/10"
          accentBorder="bg-cyan-500"
          gradientFrom="from-cyan-500/10 dark:from-cyan-500/5"
          value={formatNumber(stats.totalViews)}
          label="Total Views"
          delta={stats.deltas.views}
        />
        <StatCard
          icon={<StarIcon filled className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-100 dark:bg-amber-500/10"
          accentBorder="bg-amber-500"
          gradientFrom="from-amber-500/10 dark:from-amber-500/5"
          value={`${stats.averageRating}/10`}
          label="Average Rating"
          delta={stats.deltas.rating}
        />
        <StatCard
          icon={<PlayIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          iconBg="bg-violet-100 dark:bg-violet-500/10"
          accentBorder="bg-violet-500"
          gradientFrom="from-violet-500/10 dark:from-violet-500/5"
          value={String(stats.activeFilms)}
          label="Active Films"
          delta={stats.deltas.active}
        />
      </div>

      {/* ── Middle: Recent Films + Most Watched ────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent Films Table */}
        <GlassCard className="lg:col-span-3">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Films</h2>
            <Button variant="ghost" size="sm" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              View All
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Recently added films</caption>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wider text-slate-400 dark:border-slate-700/50 dark:text-slate-500">
                  <th scope="col" className="px-6 py-3">Film</th>
                  <th scope="col" className="px-6 py-3">Rating</th>
                  <th scope="col" className="px-6 py-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {recentFilms.map((film, i) => (
                  <tr key={film.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${i !== recentFilms.length - 1 ? "border-b border-slate-100 dark:border-slate-700/30" : ""}`}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/20 to-violet-500/20 ring-1 ring-slate-200 dark:ring-slate-700/50">
                          <FilmIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{film.title}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{film.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={`border-slate-200 font-medium dark:border-slate-600 ${film.rating >= 8.5 ? "text-emerald-600 dark:text-emerald-400" : film.rating >= 8 ? "text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-300"}`}>
                        {film.rating}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">{film.added}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Most Watched */}
        <GlassCard className="lg:col-span-2">
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Most Watched</h2>
          </div>
          <div className="space-y-1 px-4 pb-4">
            {mostWatched.map((film, i) => {
              const pct = (film.views / maxViews) * 100;
              return (
                <div key={film.id} className="group rounded-lg p-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : i === 1 ? "bg-slate-200 text-slate-600 dark:bg-slate-400/20 dark:text-slate-300" : i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{film.title}</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/50">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                      {formatNumber(film.views)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* ── Bottom: Genre Chart + Top Rated ────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Genre Distribution */}
        <GlassCard className="lg:col-span-3">
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Genre Distribution</h2>
          </div>
          <div className="px-4 pb-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreDistribution} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }} barCategoryGap="25%">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="genre" tick={{ fill: "#94a3b8", fontSize: 13 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32}>
                    {genreDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Top Rated Films */}
        <GlassCard className="lg:col-span-2">
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Rated</h2>
          </div>
          <div className="px-6 pb-4">
            {topRated.map((film, i) => (
              <div key={film.id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-slate-300 dark:text-slate-500 w-5 text-right">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{film.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <StarRating rating={film.rating} />
                        <span className="text-xs text-slate-400 dark:text-slate-500">{film.year}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-3 shrink-0 border-amber-200 bg-amber-50 font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                    {film.rating}
                  </Badge>
                </div>
                {i < topRated.length - 1 && <Separator className="bg-slate-100 dark:bg-slate-700/30" />}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
