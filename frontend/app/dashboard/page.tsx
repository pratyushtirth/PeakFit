"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import SageCard from "@/components/ai/SageCard";
import SageModal from "@/components/ai/SageModal";
import RightSidebar from "@/components/layout/RightSidebar";

interface User {
    id: number;
    fullName: string;
    email: string;
    goal: string;
    weight: number;
    targetWeight: number;
    height: number;
    age: number;
    fitnessLevel: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [mode, setMode] = useState<"strength" | "cardio">("strength");
    const [weeklyData, setWeeklyData] = useState<number[]>([0,0,0,0,0,0,0]);
    const [animatedData, setAnimatedData] = useState<number[]>([0,0,0,0,0,0,0]);
    const [loading, setLoading] = useState(true);
    const [sageOpen, setSageOpen] = useState(false);

    const loadWeekly = useCallback(async (m: string) => {
        try {
            const data: number[] = await apiFetch(`/api/progress/weekly?type=${m}`);
            setWeeklyData(data);
        } catch {
            setWeeklyData([0,0,0,0,0,0,0]);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const init = async () => {
            try {
                const userData: User = await apiFetch("/api/auth/me");
                setUser(userData);
                await loadWeekly(mode);
            } catch {
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]); // eslint-disable-line

    // Refresh chart when tab becomes visible (after logging a session)
    useEffect(() => {
        const handle = () => {
            if (document.visibilityState === "visible") loadWeekly(mode);
        };
        document.addEventListener("visibilitychange", handle);
        return () => document.removeEventListener("visibilitychange", handle);
    }, [loadWeekly, mode]);

    // Reload chart when mode toggles
    useEffect(() => {
        if (!user) return;
        loadWeekly(mode);
    }, [mode, user]); // eslint-disable-line

    // Animate bars
    useEffect(() => {
        setAnimatedData(new Array(7).fill(0));
        const t = setTimeout(() => setAnimatedData(weeklyData), 100);
        return () => clearTimeout(t);
    }, [weeklyData]);

    const goalLabel =
        user?.goal === "gain" ? "Gain Muscle"
        : user?.goal === "lose" ? "Lose Weight"
        : "Maintain";

    const maxBar = Math.max(...animatedData, 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">autorenew</span>
                    <p className="text-slate-400 mt-3">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-full">
            {/* ── CENTER ── */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 min-w-0">
                <header className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black">Welcome back, {user.fullName}! 👋</h2>
                        <p className="text-slate-400 text-sm mt-1">Ready to hit your peak performance today?</p>
                    </div>
                    <button
                        onClick={() => router.push("/dashboard/workouts")}
                        className="bg-primary hover:bg-red-800 px-5 py-2 rounded-full text-sm font-bold transition-colors flex-shrink-0"
                    >
                        + Generate Workout
                    </button>
                </header>

                <SageCard onOpen={() => setSageOpen(true)} />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Current Weight", value: user.weight ? `${user.weight} kg` : "—" },
                        { label: "Target Weight", value: user.targetWeight ? `${user.targetWeight} kg` : "—" },
                        { label: "Fitness Level", value: user.fitnessLevel || "Beginner" },
                    ].map(s => (
                        <div key={s.label} className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5">
                            <p className="text-slate-400 text-xs">{s.label}</p>
                            <h3 className="text-xl font-black mt-1">{s.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Weekly Chart */}
                <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-5">
                        <h4 className="font-bold">Weekly Performance</h4>
                        <div className="flex bg-[#1a1a1a] rounded-full p-1 text-xs gap-0.5">
                            {(["strength", "cardio"] as const).map(m => (
                                <button key={m} onClick={() => setMode(m)}
                                    className={`px-3 py-1 rounded-full capitalize transition-all ${mode === m ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-36 flex items-end gap-2">
                        {animatedData.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-[#1a1a1a] rounded-lg overflow-hidden" style={{ height: "112px" }}>
                                    <div
                                        className="bg-primary w-full rounded-lg transition-all duration-700 ease-out"
                                        style={{
                                            height: `${(h / maxBar) * 112}px`,
                                            marginTop: `${112 - (h / maxBar) * 112}px`,
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500">
                                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quote */}
                <div className="bg-gradient-to-br from-[#1a0000] to-black p-6 rounded-xl border border-primary/20">
                    <p className="text-sm italic text-slate-300">"Success isn't always about greatness. It's about consistency."</p>
                    <p className="text-primary font-bold text-sm mt-3">— Dwayne Johnson</p>
                </div>
            </div>

            {/* ── RIGHT SIDEBAR — self-manages today's session ── */}
            <RightSidebar
                goalLabel={goalLabel}
                weight={user.weight}
                targetWeight={user.targetWeight}
            />

            <SageModal open={sageOpen} onClose={() => setSageOpen(false)} />
        </div>
    );
}
