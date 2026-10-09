"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Exercise { name: string; sets: number; reps: string; weight: string; }
interface Session {
    id: number;
    type: string;
    date: string;
    durationMinutes: number;
    calories: number;
    notes: string;
    exercises: Exercise[];
}

export default function HistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const load = async () => {
            try {
                await apiFetch("/api/auth/me"); // auth check
                const data = await apiFetch("/api/workout/history");
                setSessions(data);
            } catch {
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [router]);

    const filtered = filter === "all" ? sessions : sessions.filter(s => s.type?.toLowerCase() === filter);

    const totalCalories = sessions.reduce((a, s) => a + (s.calories || 0), 0);
    const totalMinutes = sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0);

    if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading history...</div>;

    return (
        <div className="w-full text-white">
            <header className="mb-10">
                <h1 className="text-4xl font-black">Workout History</h1>
                <p className="text-slate-400 mt-2">Review every session and track your long-term progress.</p>
            </header>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { icon: "history", label: "Total Sessions", value: sessions.length },
                    { icon: "local_fire_department", label: "Total Calories", value: `${totalCalories} kcal` },
                    { icon: "timer", label: "Total Time", value: `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m` },
                ].map(s => (
                    <div key={s.label} className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5">
                        <span className="material-symbols-outlined text-primary">{s.icon}</span>
                        <p className="text-slate-400 text-xs mt-2">{s.label}</p>
                        <p className="text-2xl font-black mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {["all", "strength", "cardio"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${filter === f ? "bg-primary text-white" : "bg-[#0a0a0a] text-slate-400 hover:text-white border border-white/5"}`}>{f}</button>
                ))}
            </div>

            {/* Sessions */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-[#0a0a0a] rounded-xl border border-white/5">
                    <span className="material-symbols-outlined text-5xl text-slate-600">fitness_center</span>
                    <p className="text-slate-400 mt-4">No sessions found.</p>
                    <button onClick={() => router.push("/dashboard/workouts")} className="mt-4 bg-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-red-800 transition-colors">
                        Generate Your First Workout
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((s) => (
                        <div key={s.id} className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
                            <div
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/2 transition-colors"
                                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-lg">
                                            {s.type === "cardio" ? "directions_run" : "fitness_center"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold">{s.notes || `${s.type || "Workout"} Session`}</p>
                                        <p className="text-slate-400 text-sm">{s.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    {s.durationMinutes > 0 && (
                                        <div className="text-right hidden md:block">
                                            <p className="text-slate-400 text-xs">Duration</p>
                                            <p className="font-bold">{s.durationMinutes} min</p>
                                        </div>
                                    )}
                                    {s.calories > 0 && (
                                        <div className="text-right hidden md:block">
                                            <p className="text-slate-400 text-xs">Calories</p>
                                            <p className="font-bold">{s.calories} kcal</p>
                                        </div>
                                    )}
                                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${expanded === s.id ? "rotate-180" : ""}`}>expand_more</span>
                                </div>
                            </div>
                            {expanded === s.id && s.exercises?.length > 0 && (
                                <div className="border-t border-white/5 divide-y divide-white/5">
                                    {s.exercises.map((ex, i) => (
                                        <div key={i} className="px-5 py-3 flex items-center gap-3 text-sm">
                                            <span className="w-5 h-5 bg-white/5 rounded text-center text-xs leading-5">{i + 1}</span>
                                            <span className="flex-1">{ex.name}</span>
                                            <span className="text-slate-400">{ex.sets} × {ex.reps}</span>
                                            {ex.weight && <span className="text-slate-500">{ex.weight}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
