"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Exercise { name: string; sets: number; reps: string; }

interface RightSidebarProps {
    goalLabel: string;
    weight: number;
    targetWeight: number;
}

const PLAN_KEY        = "peakfit_active_plan";
const TODAY_IDX_KEY   = "peakfit_today_day_index";
// BUG FIX 3: read the flag set by workouts/page.tsx after logging
const DAY_LOGGED_KEY  = "peakfit_day_logged";

export default function RightSidebar({ goalLabel, weight, targetWeight }: RightSidebarProps) {
    const router = useRouter();

    const [todayExercises, setTodayExercises] = useState<Exercise[]>([]);
    const [todayLabel, setTodayLabel]         = useState("");
    const [checked, setChecked]               = useState<Set<number>>(new Set());
    const [logging, setLogging]               = useState(false);
    const [logged, setLogged]                 = useState(false);
    const [source, setSource]                 = useState<"plan" | "session" | "none">("none");

    useEffect(() => {
        loadTodayData();
    }, []);

    const loadTodayData = async () => {
        // BUG FIX 3: if the user already logged today's session from the workouts page,
        // show "Day Complete" immediately — no need to show unchecked exercises again
        const alreadyLogged = localStorage.getItem(DAY_LOGGED_KEY) === "1";
        if (alreadyLogged) {
            setLogged(true);
            setSource("plan");
            return;
        }

        // 1. Check active plan in localStorage
        const stored = localStorage.getItem(PLAN_KEY);
        if (stored) {
            try {
                const plan = JSON.parse(stored);
                const todayIdx = parseInt(localStorage.getItem(TODAY_IDX_KEY) || "0");
                const day = plan.days?.[todayIdx];
                if (day && day.exercises?.length > 0) {
                    setTodayExercises((day.exercises ?? []).map((e: any) => ({
                        name: e.name, sets: e.sets, reps: e.reps,
                    })));
                    setTodayLabel(day.day || `Day ${todayIdx + 1}`);
                    setSource("plan");
                    return;
                }
            } catch { /* fall through */ }
        }

        // 2. Fallback: backend session
        try {
            const session = await apiFetch("/api/sessions/today");
            const exs = (session.exercises || []).map((e: any) => ({
                name: e.name, sets: e.sets || 3, reps: e.reps || "10",
            }));
            if (exs.length > 0) {
                setTodayExercises(exs);
                setTodayLabel(session.type || "Today's Session");
                setSource("session");
            } else {
                setSource("none");
            }
        } catch {
            setSource("none");
        }
    };

    const toggleCheck = (i: number) => {
        setChecked(prev => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    };

    const allDone = todayExercises.length > 0 && checked.size === todayExercises.length;

    // "Mark Day Complete" — called when user checks off all exercises IN the sidebar
    const markComplete = async () => {
        if (!allDone || logging) return;
        setLogging(true);
        try {
            const stored = localStorage.getItem(PLAN_KEY);
            let sessionType = "strength";
            let duration = 45;
            let notes = todayLabel;

            if (stored) {
                const plan = JSON.parse(stored);
                notes = plan.planName || todayLabel;
                const est = parseInt(plan.estimatedTime);
                if (!isNaN(est)) duration = est;
            }

            await apiFetch("/api/sessions", {
                method: "POST",
                body: JSON.stringify({
                    type: sessionType,
                    durationMinutes: duration,
                    notes,
                    exercises: todayExercises.map(e => ({
                        name: e.name, sets: e.sets, reps: e.reps, weight: "bodyweight",
                    })),
                }),
            });

            setLogged(true);
            // Mark logged + advance to next day
            localStorage.setItem(DAY_LOGGED_KEY, "1");
            const currentIdx = parseInt(localStorage.getItem(TODAY_IDX_KEY) || "0");
            localStorage.setItem(TODAY_IDX_KEY, String(currentIdx + 1));
        } catch {
            alert("Failed to log session. Please try again.");
        } finally {
            setLogging(false);
        }
    };

    return (
        <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#050505] border-l border-white/5 flex flex-col gap-4 p-4 overflow-y-auto">

            {/* AI Workout Generator Card */}
            <div
                className="rounded-xl p-4 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #9e0000, #7a0000)" }}
                onClick={() => router.push("/dashboard/workouts")}
            >
                <h4 className="text-sm font-black text-white">AI Workout Generator</h4>
                <p className="text-[11px] text-white/60 mt-1 leading-relaxed">Get a personalized plan built around your stats.</p>
                <button
                    onClick={e => { e.stopPropagation(); router.push("/dashboard/workouts"); }}
                    className="mt-3 w-full bg-black/50 hover:bg-black/70 border border-white/15 text-white font-bold text-xs py-2 rounded-lg transition-all"
                >
                    ✨ Generate Plan
                </button>
            </div>

            {/* Today's Session */}
            <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-4 flex-shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold">Today's Session</h4>
                    {source === "plan" && !logged && (
                        <span className="text-[9px] bg-primary/20 text-red-400 border border-primary/30 px-2 py-0.5 rounded-full font-bold">ACTIVE PLAN</span>
                    )}
                    {source === "session" && (
                        <button onClick={() => router.push("/dashboard/history")} className="text-[10px] text-primary hover:underline">
                            View all
                        </button>
                    )}
                </div>

                {source === "none" ? (
                    <div className="text-center py-4">
                        <span className="material-symbols-outlined text-3xl text-slate-700">fitness_center</span>
                        <p className="text-slate-500 text-[11px] mt-2">No workout for today yet.</p>
                        <button onClick={() => router.push("/dashboard/workouts")} className="mt-2 text-[10px] text-primary hover:underline">
                            Generate one →
                        </button>
                    </div>
                ) : logged ? (
                    <div className="text-center py-4">
                        <span className="material-symbols-outlined text-3xl text-green-500">check_circle</span>
                        <p className="text-green-400 text-[11px] mt-2 font-bold">Day logged! Great work 💪</p>
                        <button
                            onClick={() => router.push("/dashboard/workouts")}
                            className="mt-2 text-[10px] text-primary hover:underline"
                        >
                            View full plan →
                        </button>
                    </div>
                ) : (
                    <>
                        {todayLabel && (
                            <p className="text-[10px] text-slate-500 mb-2 font-medium uppercase tracking-wider">{todayLabel}</p>
                        )}
                        <div className="space-y-1.5 mb-3">
                            {todayExercises.map((ex, i) => (
                                <div
                                    key={i}
                                    onClick={() => toggleCheck(i)}
                                    className={`flex items-center gap-2 text-xs cursor-pointer rounded-lg px-2 py-1.5 transition-all ${checked.has(i) ? "bg-green-900/20" : "hover:bg-white/3"}`}
                                >
                                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${checked.has(i) ? "bg-green-600 border-green-600" : "border-white/20"}`}>
                                        {checked.has(i) && <span className="text-white text-[9px] font-black">✓</span>}
                                    </div>
                                    <span className={`flex-1 truncate ${checked.has(i) ? "line-through text-slate-600" : "text-slate-300"}`}>{ex.name}</span>
                                    <span className="text-slate-600 flex-shrink-0 text-[10px]">{ex.sets}×{ex.reps}</span>
                                </div>
                            ))}
                        </div>

                        {/* Progress bar */}
                        {todayExercises.length > 0 && (
                            <div className="mb-3">
                                <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                                    <span>{checked.size}/{todayExercises.length} done</span>
                                    <span>{Math.round((checked.size / todayExercises.length) * 100)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-300"
                                        style={{ width: `${(checked.size / todayExercises.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Mark Day Complete — only when all checked */}
                        {allDone && (
                            <button
                                onClick={markComplete}
                                disabled={logging}
                                className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white font-black text-[11px] py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {logging ? "Saving..." : "Mark Day Complete"}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Goal & Milestones */}
            <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-4">
                <h4 className="text-xs font-bold mb-3">Goal & Milestones</h4>
                <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-base">flag</span>
                    <div>
                        <p className="text-xs font-bold">{goalLabel || "—"}</p>
                        <p className="text-[10px] text-slate-500">{weight || "—"} → {targetWeight || "—"} kg</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[{ emoji: "🔥", label: "Active" }, { emoji: "💪", label: "Strong" }, { emoji: "⭐", label: "Elite" }].map(m => (
                        <div key={m.label} className="bg-[#141414] rounded-lg p-2 text-center">
                            <div className="text-base">{m.emoji}</div>
                            <p className="text-[9px] text-slate-500 mt-1">{m.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
