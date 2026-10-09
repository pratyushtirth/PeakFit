"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface User {
    id: number;
    name: string;
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {

            // ✅ Token guard (FIX)
            const token =
                localStorage.getItem("peakfit_token") ||
                sessionStorage.getItem("peakfit_token");

            if (!token) {
                router.push("/auth/login");
                return;
            }

            try {
                const data = await apiFetch("/api/auth/me");
                setUser(data);
            } catch (err) {
                console.error("Auth error:", err);

                // ✅ clear BOTH storages (FIX)
                localStorage.removeItem("peakfit_token");
                sessionStorage.removeItem("peakfit_token");

                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white">
                Loading dashboard...
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto">

            {/* HEADER */}
            <header className="flex justify-between items-center mb-10">

                {/* LEFT */}
                <div>
                    <h2 className="text-4xl font-black">
                        Welcome back, {user.name}! 👋
                    </h2>

                    <p className="text-slate-400 mt-2">
                        Ready to hit your peak performance today?
                    </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">

                    {/* Notification Bell */}
                    <div className="w-11 h-11 rounded-full bg-[#0a0a0a] flex items-center justify-center hover:bg-[#1a1a1a] transition">
                        <span className="material-symbols-outlined text-slate-300">
                            notifications
                        </span>
                    </div>

                    {/* Log Session Button */}
                    <button
                        onClick={() => {
                            console.log("Log session clicked");
                        }}
                        className="flex items-center gap-2 bg-primary px-5 py-2.5 rounded-full font-bold hover:opacity-90 transition"
                    >
                        <span className="material-symbols-outlined text-sm">
                            add
                        </span>
                        Log Session
                    </button>

                </div>

            </header>

            {/* GRID */}
            <div className="grid grid-cols-12 gap-6">

                {/* LEFT */}
                <div className="col-span-8 flex flex-col gap-6">

                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-6">

                        <div className="bg-[#0a0a0a] p-6 rounded-xl">
                            <p className="text-slate-400 text-sm uppercase">
                                Current Weight
                            </p>
                            <h3 className="text-3xl font-black mt-2">
                                {user.weight || 0}
                                <span className="text-sm text-slate-500"> kg</span>
                            </h3>
                        </div>

                        <div className="bg-[#0a0a0a] p-6 rounded-xl">
                            <p className="text-slate-400 text-sm uppercase">
                                Target Weight
                            </p>
                            <h3 className="text-3xl font-black mt-2">
                                {user.targetWeight || 0}
                                <span className="text-sm text-slate-500"> kg</span>
                            </h3>
                        </div>

                        <div className="bg-[#0a0a0a] p-6 rounded-xl">
                            <p className="text-slate-400 text-sm uppercase">
                                Fitness Level
                            </p>
                            <h3 className="text-3xl font-black mt-2">
                                {user.fitnessLevel || "Beginner"}
                            </h3>
                        </div>

                    </div>

                    {/* WEEKLY PERFORMANCE */}
                    <div className="bg-[#0a0a0a] p-8 rounded-xl">
                        <h4 className="text-xl font-bold mb-6">
                            Weekly Performance
                        </h4>

                        <div className="h-40 flex items-end gap-3">
                            {[40, 60, 80, 50, 70, 95, 20].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="bg-primary/60 w-full rounded-t-lg"
                                        style={{ height: `${h}%` }}
                                    />
                                    <span className="text-xs text-slate-500">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* QUOTE */}
                    <div className="bg-[#1a0000] p-8 rounded-xl border border-primary/20">
                        <p className="text-lg italic">
                            "Success isn't always about greatness. It's about consistency.
                            Consistent hard work leads to success."
                        </p>

                        <p className="text-primary mt-2 font-bold">
                            — Dwayne Johnson
                        </p>
                    </div>

                </div>

                {/* RIGHT */}
                <div className="col-span-4 flex flex-col gap-6">

                    {/* AI GENERATOR */}
                    <div className="bg-primary p-8 rounded-xl">
                        <h4 className="text-2xl font-black text-black">
                            AI Workout Generator
                        </h4>

                        <p className="text-black/70 mt-2">
                            Personalized plan based on your progress
                        </p>

                        <button className="mt-6 w-full py-4 bg-black text-primary font-bold rounded-xl">
                            Generate Plan
                        </button>
                    </div>

                    {/* PROFILE */}
                    <div className="bg-[#0a0a0a] p-6 rounded-xl">
                        <h4 className="text-lg font-bold mb-4">
                            Profile Summary
                        </h4>

                        <div className="flex flex-col gap-2 text-slate-400 text-sm">
                            <p>Email: {user.email}</p>
                            <p>Age: {user.age || "Not set"}</p>
                            <p>Height: {user.height || "Not set"} cm</p>
                            <p>Goal: {user.goal || "Not set"}</p>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}