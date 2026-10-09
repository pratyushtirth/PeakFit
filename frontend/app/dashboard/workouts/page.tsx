"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Exercise { name: string; sets: number; reps: string; rest: string; notes: string; }
interface Day { day: string; exercises: Exercise[]; }
interface WorkoutPlan {
    planName: string;
    description: string;
    frequency: string;
    estimatedTime: string;
    complexity: number;
    injuryNote?: string;
    days: Day[];
}

export const PLAN_STORAGE_KEY    = "peakfit_active_plan";
export const PLAN_TODAY_INDEX_KEY = "peakfit_today_day_index";
// BUG FIX 3: flag that tells RightSidebar the session was already logged here
export const PLAN_DAY_LOGGED_KEY = "peakfit_day_logged";

export default function GenerateWorkoutPage() {
    const router = useRouter();
    const [user, setUser]               = useState<any>(null);
    const [loading, setLoading]         = useState(false);
    const [plan, setPlan]               = useState<WorkoutPlan | null>(null);
    const [error, setError]             = useState("");
    const [activeDay, setActiveDay]     = useState(0);
    const [preference, setPreference]   = useState("gym");
    const [goal, setGoal]               = useState("muscle-gain");
    const [daysPerWeek, setDaysPerWeek] = useState(4);
    const [saving, setSaving]           = useState(false);
    const [saved, setSaved]             = useState(false);
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

    useEffect(() => {
        apiFetch("/api/auth/me").then(setUser).catch(() => router.push("/auth/login"));
        const stored = localStorage.getItem(PLAN_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Only restore if every day has exercises — discard stale/truncated plans
                const valid = parsed?.days?.length > 0 &&
                    parsed.days.every((d: any) => d.exercises && d.exercises.length > 0);
                if (valid) {
                    setPlan(parsed);
                    setActiveDay(0);
                } else {
                    // Stale or truncated plan — clear it so user gets a fresh start
                    localStorage.removeItem(PLAN_STORAGE_KEY);
                    localStorage.removeItem(PLAN_TODAY_INDEX_KEY);
                    localStorage.removeItem(PLAN_DAY_LOGGED_KEY);
                }
            } catch { localStorage.removeItem(PLAN_STORAGE_KEY); }
        }
    }, [router]);

    const generate = async () => {
        setLoading(true);
        setError("");
        setPlan(null);
        setCompletedExercises(new Set());
        setSaved(false);
        try {
            const raw = await apiFetch("/api/workout/generate", {
                method: "POST",
                body: JSON.stringify({ trainingPreference: preference, primaryGoal: goal, daysPerWeek }),
            });

            // Validate: reject if any day has 0 exercises (truncated AI response)
            const hasEmptyDay = raw?.days?.some((d: any) => !d.exercises || d.exercises.length === 0);
            if (!raw?.days || raw.days.length === 0 || hasEmptyDay) {
                setError("The AI returned an incomplete plan (some days had 0 exercises). Please click Generate again.");
                return;
            }

            setPlan(raw);
            setActiveDay(0);
            localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(raw));
            localStorage.setItem(PLAN_TODAY_INDEX_KEY, "0");
            localStorage.removeItem(PLAN_DAY_LOGGED_KEY);
        } catch (e: any) {
            const msg = (e.message || "").toLowerCase();
            if (msg.includes("rate_limited") || msg.includes("rate limit") || msg.includes("daily limit")) {
                setError("⏳ Daily AI limit reached. Please wait a few minutes and try again.");
            } else if (msg.includes("model_busy") || msg.includes("model is") || msg.includes("503") || msg.includes("502")) {
                setError("⚠️ The AI provider is currently busy. Please click Generate again in a moment.");
            } else if (msg.includes("401") || msg.includes("api key") || msg.includes("unauthorized")) {
                setError("🔑 Invalid API key. Check your OPENROUTER_API_KEY environment variable.");
            } else if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("network")) {
                setError("🌐 Network timeout. Check your internet connection and try again.");
            } else if (msg.includes("incomplete") || msg.includes("0 exercises")) {
                setError("🔄 The AI returned an incomplete plan. Please click Generate again.");
            } else {
                setError("❌ Could not generate the plan. The AI provider may be temporarily unavailable — please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleExercise = (key: string) => {
        setCompletedExercises(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const saveSession = async () => {
        if (!plan) return;
        setSaving(true);
        try {
            const exercises = (plan.days?.[activeDay]?.exercises ?? []).map(ex => ({
                name: ex.name, sets: ex.sets, reps: ex.reps, weight: "bodyweight",
            })) || [];

            const sessionType = preference === "outdoor" ? "cardio" : "strength";

            await apiFetch("/api/sessions", {
                method: "POST",
                body: JSON.stringify({
                    type: sessionType,
                    durationMinutes: parseInt(plan.estimatedTime) || 45,
                    notes: plan.planName,
                    exercises,
                }),
            });

            setSaved(true);
            localStorage.setItem(PLAN_TODAY_INDEX_KEY, String(activeDay));
            // BUG FIX 3: signal to RightSidebar that today's session is done
            localStorage.setItem(PLAN_DAY_LOGGED_KEY, "1");

            // Plan stays — user can browse other days
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch {
            alert("Failed to save session. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const allExercisesInDay = plan?.days[activeDay]?.exercises?.length ?? 0;
    const completedInDay    = plan?.days[activeDay]?.exercises?.filter(
        (_, i) => completedExercises.has(`${activeDay}-${i}`)
    )?.length ?? 0;
    const workoutProgress   = allExercisesInDay > 0
        ? Math.round((completedInDay / allExercisesInDay) * 100) : 0;

    const complexityDots = (c: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i < c ? "bg-primary" : "bg-white/10"}`} />
        ));

    return (
        <div className="w-full text-white p-6">
            <header className="mb-8">
                <h1 className="text-4xl font-black">AI Workout Generator</h1>
                <p className="text-slate-400 mt-2">Let our AI build a personalized plan based on your profile and preferences.</p>
            </header>

            {/* Config Card */}
            <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6 border border-white/5">
                <h2 className="font-bold mb-5 text-lg">Customize Your Plan</h2>
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Training Preference */}
                    <div>
                        <label className="text-xs uppercase tracking-widest text-slate-400 mb-3 block">Training Preference</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["gym", "home", "outdoor"].map(p => (
                                <button key={p} onClick={() => setPreference(p)}
                                    className={`py-3 rounded-lg text-sm font-medium border transition-all capitalize ${preference === p ? "bg-primary border-primary text-white" : "border-white/10 text-slate-400 hover:border-primary/50"}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Primary Goal */}
                    <div>
                        <label className="text-xs uppercase tracking-widest text-slate-400 mb-3 block">Primary Goal</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ id: "muscle-gain", label: "Muscle" }, { id: "weight-loss", label: "Fat Loss" }, { id: "endurance", label: "Endurance" }].map(g => (
                                <button key={g.id} onClick={() => setGoal(g.id)}
                                    className={`py-3 rounded-lg text-sm font-medium border transition-all ${goal === g.id ? "bg-primary border-primary text-white" : "border-white/10 text-slate-400 hover:border-primary/50"}`}>
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Days Per Week */}
                    <div>
                        <label className="text-xs uppercase tracking-widest text-slate-400 mb-3 block">Days Per Week</label>
                        <div className="grid grid-cols-6 gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map(d => (
                                <button key={d} onClick={() => setDaysPerWeek(d)}
                                    className={`py-3 rounded-lg text-sm font-bold border transition-all ${daysPerWeek === d ? "bg-primary border-primary text-white" : "border-white/10 text-slate-400 hover:border-primary/50"}`}>
                                    {d}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1.5">{daysPerWeek} day{daysPerWeek > 1 ? "s" : ""} / week</p>
                    </div>
                </div>

                {user && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-slate-400">
                        Using your saved stats: <span className="text-white">{user.weight}kg · {user.height}cm · {user.age}yrs · {user.fitnessLevel}</span>
                    </div>
                )}
                <button onClick={generate} disabled={loading}
                    className="mt-6 w-full bg-primary hover:bg-red-800 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                    {loading ? (
                        <><span className="material-symbols-outlined animate-spin">autorenew</span> Generating your {daysPerWeek}-day plan...</>
                    ) : (
                        <><span className="material-symbols-outlined">auto_awesome</span> Generate My {daysPerWeek}-Day Plan</>
                    )}
                </button>
                {error && <p className="mt-3 text-rose-400 text-sm text-center">{error}</p>}
            </div>

            {/* Plan Output */}
            {plan && (
                <div className="space-y-6">
                    {/* Plan Header */}
                    <div className="bg-gradient-to-br from-primary/20 to-black p-6 rounded-xl border border-primary/30">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <h2 className="text-2xl font-black">{plan.planName}</h2>
                                <p className="text-slate-300 mt-2 max-w-xl">{plan.description}</p>
                                {plan.injuryNote && (
                                    <div className="mt-3 flex items-start gap-2 bg-yellow-900/30 border border-yellow-600/30 text-yellow-400 px-3 py-2 rounded-lg text-sm">
                                        <span className="material-symbols-outlined text-base mt-0.5">warning</span>
                                        {plan.injuryNote}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-black/40 px-4 py-3 rounded-lg text-center">
                                    <p className="text-xs text-slate-400">Frequency</p>
                                    <p className="font-bold">{plan.frequency}</p>
                                </div>
                                <div className="bg-black/40 px-4 py-3 rounded-lg text-center">
                                    <p className="text-xs text-slate-400">Duration</p>
                                    <p className="font-bold">{plan.estimatedTime}</p>
                                </div>
                                <div className="bg-black/40 px-4 py-3 rounded-lg text-center">
                                    <p className="text-xs text-slate-400">Complexity</p>
                                    <div className="flex gap-1 mt-1 justify-center">{complexityDots(plan.complexity)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {plan.days.map((day, i) => (
                            <button key={i}
                                onClick={() => { setActiveDay(i); setCompletedExercises(new Set()); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeDay === i ? "bg-primary text-white" : "bg-[#0a0a0a] text-slate-400 hover:text-white border border-white/10"}`}>
                                {day.day}
                            </button>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    {allExercisesInDay > 0 && (
                        <div className="bg-[#0a0a0a] px-5 py-3 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2 text-xs">
                                <span className="text-slate-400">Session Progress</span>
                                <span className="font-bold text-primary">{completedInDay}/{allExercisesInDay} exercises</span>
                            </div>
                            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${workoutProgress}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Exercise List */}
                    <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5">
                        <div className="p-5 border-b border-white/5">
                            <h3 className="font-bold text-lg">{plan.days[activeDay]?.day}</h3>
                            <p className="text-slate-400 text-sm">{plan.days[activeDay]?.exercises?.length ?? 0} exercises · Click an exercise to mark it done</p>
                        </div>
                        <div className="divide-y divide-white/5">
                            {(plan.days[activeDay]?.exercises ?? []).map((ex, i) => {
                                const key = `${activeDay}-${i}`;
                                const done = completedExercises.has(key);
                                return (
                                    <div key={i} onClick={() => toggleExercise(key)}
                                        className={`p-5 flex items-center gap-4 cursor-pointer transition-colors ${done ? "bg-green-900/10" : "hover:bg-white/2"}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-all ${done ? "bg-green-700 text-white" : "bg-primary/20 text-primary"}`}>
                                            {done ? "✓" : i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-bold ${done ? "line-through text-slate-500" : ""}`}>{ex.name}</p>
                                            {ex.notes && <p className="text-slate-500 text-sm">{ex.notes}</p>}
                                        </div>
                                        <div className="flex gap-3 text-center text-sm">
                                            <div><p className="text-slate-400 text-xs">Sets</p><p className="font-bold">{ex.sets}</p></div>
                                            <div><p className="text-slate-400 text-xs">Reps</p><p className="font-bold">{ex.reps}</p></div>
                                            <div><p className="text-slate-400 text-xs">Rest</p><p className="font-bold">{ex.rest}</p></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button onClick={saveSession} disabled={saving || saved}
                            className="flex-1 bg-green-700 hover:bg-green-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                            <span className="material-symbols-outlined">{saved ? "check_circle" : "save"}</span>
                            {saved ? "Logged! Returning to dashboard..." : saving ? "Saving..." : `Log Day ${activeDay + 1} Session`}
                        </button>
                        <button onClick={generate} disabled={loading}
                            className="px-6 bg-white/5 hover:bg-white/10 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                            <span className="material-symbols-outlined">refresh</span>Regenerate
                        </button>
                    </div>

                    {workoutProgress === 100 && !saved && (
                        <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm text-center font-bold">
                            🎉 All exercises done! Click "Log Day {activeDay + 1} Session" to save.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
