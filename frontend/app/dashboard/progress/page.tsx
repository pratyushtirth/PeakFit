"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface WeightEntry { date: string; weight: number; }

const WEIGHT_LOG_KEY = "peakfit_weight_log";

export default function ProgressPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [mode, setMode] = useState<"strength" | "cardio">("strength");
    const [weeklyData, setWeeklyData] = useState<number[]>([0,0,0,0,0,0,0]);
    const [animatedData, setAnimatedData] = useState<number[]>([0,0,0,0,0,0,0]);
    const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
    const [newWeight, setNewWeight] = useState("");
    const [loading, setLoading] = useState(true);

    // FIX 6: Load persisted weight log from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(WEIGHT_LOG_KEY);
            if (saved) setWeightLog(JSON.parse(saved));
        } catch { /* ignore parse errors */ }
    }, []);

    useEffect(() => {
        apiFetch("/api/auth/me")
            .then(u => {
                setUser(u);
                // Only seed from profile if localStorage had nothing
                const saved = localStorage.getItem(WEIGHT_LOG_KEY);
                if (!saved && u.weight) {
                    const today = new Date().toISOString().split("T")[0];
                    const initial = [{ date: today, weight: u.weight }];
                    setWeightLog(initial);
                    localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(initial));
                }
            })
            .catch(() => router.push("/auth/login"))
            .finally(() => setLoading(false));
    }, [router]);

    useEffect(() => {
        if (!user) return;
        apiFetch(`/api/progress/weekly?type=${mode}`)
            .then(data => setWeeklyData(data))
            .catch(() => setWeeklyData([0,0,0,0,0,0,0]));
    }, [mode, user]);

    useEffect(() => {
        setAnimatedData(new Array(7).fill(0));
        const t = setTimeout(() => setAnimatedData(weeklyData), 100);
        return () => clearTimeout(t);
    }, [weeklyData]);

    const logWeight = () => {
        const w = parseFloat(newWeight);
        if (!w || w <= 0 || w > 500) return;
        const today = new Date().toISOString().split("T")[0];
        const newEntry: WeightEntry = { date: today, weight: w };
        const updated = [newEntry, ...weightLog.slice(0, 29)]; // keep max 30 entries
        setWeightLog(updated);
        // FIX 6: Persist to localStorage so it survives refresh
        localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(updated));
        setNewWeight("");
    };

    const totalMinutes = weeklyData.reduce((a, b) => a + b, 0);
    const sessionsThisWeek = weeklyData.filter(v => v > 0).length;
    const streak = weeklyData.slice().reverse().findIndex(v => v === 0);
    const currentStreak = streak === -1 ? 7 : streak;

    const progressPct = user && user.weight && user.targetWeight
        ? Math.min(100, Math.max(0, Math.round(
            ((user.weight - user.targetWeight) / (user.weight - user.targetWeight + 1)) * 100
          )))
        : 0;

    const weightDiff = user && weightLog.length > 0
        ? (weightLog[0].weight - (user.targetWeight || weightLog[0].weight)).toFixed(1)
        : "0.0";

    if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;

    return (
        <div className="w-full text-white">
            <header className="mb-10">
                <h1 className="text-4xl font-black">Progress Tracker</h1>
                <p className="text-slate-400 mt-2">Track your weekly performance and body composition over time.</p>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: "local_fire_department", label: "This Week", value: `${sessionsThisWeek} sessions`, color: "text-orange-400" },
                    { icon: "timer", label: "Total Minutes", value: `${totalMinutes} min`, color: "text-blue-400" },
                    { icon: "bolt", label: "Current Streak", value: `${currentStreak} days`, color: "text-yellow-400" },
                    { icon: "trending_down", label: "To Target", value: `${weightDiff} kg`, color: "text-primary" },
                ].map(s => (
                    <div key={s.label} className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5">
                        <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                        <p className="text-slate-400 text-xs mt-2">{s.label}</p>
                        <p className="text-2xl font-black mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Weekly Chart */}
                    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg">Weekly Activity</h2>
                            <div className="flex bg-[#1a1a1a] rounded-full p-1 text-xs">
                                {(["strength", "cardio"] as const).map(m => (
                                    <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded-full capitalize transition-all ${mode === m ? "bg-primary text-white" : "text-slate-400"}`}>{m}</button>
                                ))}
                            </div>
                        </div>
                        <div className="h-44 flex items-end gap-3">
                            {animatedData.map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs text-slate-500">{h > 0 ? `${h}m` : ""}</span>
                                    <div className="w-full bg-[#1a1a1a] rounded-lg overflow-hidden" style={{ height: "128px" }}>
                                        <div className="bg-primary w-full rounded-lg transition-all duration-700 ease-out" style={{ height: `${(h / 100) * 128}px`, marginTop: `${128 - (h / 100) * 128}px` }} />
                                    </div>
                                    <span className="text-xs text-slate-500">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weight Goal Progress */}
                    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                        <h2 className="font-bold text-lg mb-4">Weight Goal Progress</h2>
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Current: <strong className="text-white">{user?.weight || 0} kg</strong></span>
                            <span>Target: <strong className="text-primary">{user?.targetWeight || 0} kg</strong></span>
                        </div>
                        <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{progressPct}% toward your goal</p>
                    </div>
                </div>

                {/* Right Column - Weight Log */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                        <h2 className="font-bold text-lg mb-4">Log Weight</h2>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="0.1"
                                min="1"
                                max="500"
                                value={newWeight}
                                onChange={e => setNewWeight(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && logWeight()}
                                placeholder="e.g. 78.5 kg"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600 text-sm"
                            />
                            <button onClick={logWeight} className="bg-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-800 transition-colors">
                                Log
                            </button>
                        </div>
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                            {weightLog.length === 0 ? (
                                <p className="text-slate-500 text-sm">No entries yet. Log your weight above.</p>
                            ) : weightLog.map((e, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                                    <span className="text-slate-400">{e.date}</span>
                                    <span className="font-bold">{e.weight} kg</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                        <h2 className="font-bold text-lg mb-4">Achievements</h2>
                        <div className="space-y-3">
                            {[
                                { emoji: "🔥", title: "First Workout", desc: "Completed your first session", unlocked: true },
                                { emoji: "💪", title: "3-Day Streak", desc: "Worked out 3 days in a row", unlocked: currentStreak >= 3 },
                                { emoji: "🏆", title: "Week Warrior", desc: "Completed a full week", unlocked: sessionsThisWeek >= 7 },
                                { emoji: "⚡", title: "Power User", desc: "Logged 10+ sessions", unlocked: false },
                            ].map(a => (
                                <div key={a.title} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${a.unlocked ? "border-primary/30 bg-primary/5" : "border-white/5 opacity-40"}`}>
                                    <span className="text-2xl">{a.emoji}</span>
                                    <div>
                                        <p className="font-bold text-sm">{a.title}</p>
                                        <p className="text-xs text-slate-400">{a.desc}</p>
                                    </div>
                                    {a.unlocked && <span className="material-symbols-outlined text-primary ml-auto text-sm">check_circle</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
