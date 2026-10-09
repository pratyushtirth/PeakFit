"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
    fullName: string;
    email: string;
    age: number;
    height: number;
    weight: number;
    targetWeight: number;
    goal: string;
    fitnessLevel: string;
};

export default function ProfilePage() {
    const [form, setForm] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // ✅ FIXED: use apiFetch (proxy), not hardcoded localhost
                const data = await apiFetch("/api/auth/me");
                setForm({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    age: data.age ?? 0,
                    height: data.height ?? 0,
                    weight: data.weight ?? 0,
                    targetWeight: data.targetWeight ?? 0,
                    goal: data.goal || "lose",
                    fitnessLevel: data.fitnessLevel || "beginner",
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!form) return;
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        setSaving(true);
        try {
            // ✅ FIXED: use apiFetch proxy
            await apiFetch("/api/profile", {
                method: "PUT",
                body: JSON.stringify({
                    fullName: form.fullName,
                    age: Number(form.age),
                    height: Number(form.height),
                    weight: Number(form.weight),
                    targetWeight: Number(form.targetWeight),
                    goal: form.goal,
                    fitnessLevel: form.fitnessLevel,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) return (
        <div className="flex items-center justify-center min-h-screen text-white">
            <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">settings</span>
                <p className="mt-2 text-slate-400">Loading profile...</p>
            </div>
        </div>
    );

    return (
        <main className="pb-12 text-white">
            <div className="mb-8">
                <h1 className="text-4xl font-black uppercase">Account Settings</h1>
                <p className="text-gray-400 text-xs uppercase tracking-widest mt-2">
                    Manage your performance metrics and identity
                </p>
            </div>

            {saved && (
                <div className="mb-6 flex items-center gap-3 bg-green-900/30 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
                    <span className="material-symbols-outlined">check_circle</span>
                    Profile updated successfully!
                </div>
            )}

            <div className="bg-[#111] rounded-xl border border-white/10 shadow-2xl">
                <div className="h-1 bg-primary w-full rounded-t-xl" />
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <section>
                        <h2 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Personal Identity</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Full Name</label>
                                <input name="fullName" value={form.fullName} onChange={handleChange} className="input-dark" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Email</label>
                                <input name="email" value={form.email} readOnly className="input-dark opacity-50 cursor-not-allowed" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Biometric Data</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { name: "age", label: "Age (yrs)" },
                                { name: "height", label: "Height (cm)" },
                                { name: "weight", label: "Weight (kg)" },
                                { name: "targetWeight", label: "Target (kg)" },
                            ].map(f => (
                                <div key={f.name} className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">{f.label}</label>
                                    <input type="number" name={f.name} value={(form as any)[f.name]} onChange={handleChange} className="input-dark" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest mb-4 text-gray-400">Fitness Strategy</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Goal</label>
                                <select name="goal" value={form.goal} onChange={handleChange} className="input-dark">
                                    <option value="lose">Lose Weight</option>
                                    <option value="gain">Gain Muscle</option>
                                    <option value="maintain">Maintain</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">Fitness Level</label>
                                <select name="fitnessLevel" value={form.fitnessLevel} onChange={handleChange} className="input-dark">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-between items-center border-t border-white/10 pt-6">
                        <button type="button" className="text-gray-500 text-xs uppercase hover:text-rose-400 transition-colors">
                            Delete Account
                        </button>
                        <button type="submit" disabled={saving} className="bg-primary hover:bg-red-800 px-8 py-3 text-xs font-bold uppercase rounded-lg shadow-lg transition-all disabled:opacity-60">
                            {saving ? "Saving..." : "Update Profile"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
                {[
                    { icon: "shield", title: "Data Privacy", desc: "Your data is encrypted and secure." },
                    { icon: "cloud_sync", title: "Cloud Sync", desc: "Synced across all your devices." },
                    { icon: "star", title: "Elite Access", desc: "Active membership — all features unlocked." },
                ].map(c => (
                    <div key={c.title} className="p-5 border border-white/10 bg-white/5 rounded-lg flex gap-3 items-start">
                        <span className="material-symbols-outlined text-primary mt-0.5">{c.icon}</span>
                        <div>
                            <h4 className="text-xs uppercase font-bold mb-1">{c.title}</h4>
                            <p className="text-gray-400 text-xs">{c.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
