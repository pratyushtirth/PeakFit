"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [goal, setGoal] = useState("lose");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { alert("Passwords do not match"); return; }
        setLoading(true);
        try {
            // ✅ FIXED: use /api/ proxy, not hardcoded backend URL
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fullName, email, password, goal }),
            });
            if (!res.ok) { const err = await res.text(); alert(err); return; }
            router.push("/auth/login");
        } catch (error) {
            console.error(error);
            alert("Something went wrong while registering.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-black text-slate-100 font-display">
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 lg:px-20">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
                    <h1 className="text-xl font-bold tracking-widest uppercase">PEAK FIT</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">Already have an account?</span>
                    <a href="/auth/login" className="text-sm font-semibold text-primary hover:underline">Log In</a>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-4xl border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row bg-neutral-900/80">
                    <div className="hidden md:flex md:w-5/12 relative overflow-hidden group bg-black">
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmosOYpikyjKLuxzW-Ez_hvZfLu550uPE_INIiReujVa__JxoaztAiYcfjSeB7iKSHEiGTLB18iIxDnsQUIxQGlvGBTX67RmXfsviu6PyKiHRKr3UCfP_0UWDJ_tpsV56tdMBpujoJxCXPOmxGddTLYXis_l9ALtPXbXEf8v6SBI2AOn0GfQYw4eJHPwKm8yTGr3r1URPeIcRVtlOiDrK5GFZmt2FNC5XIhZ02RzKOz8YKxG-jj9pbU_ovBGanc9COIzfn1bdepiAD" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Fitness athlete" />
                        <div className="absolute bottom-10 left-10 z-20">
                            <h2 className="text-3xl font-bold text-white leading-tight">Reach your <br /><span className="text-primary uppercase tracking-tighter">Peak Performance</span></h2>
                            <p className="text-white/70 mt-4 max-w-xs">Join thousands of athletes transforming their lives today.</p>
                        </div>
                    </div>
                    <div className="w-full md:w-7/12 p-8 lg:p-12">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold">Create Account</h2>
                            <p className="text-slate-400 mt-2">Start your transformation journey</p>
                        </div>
                        <form className="space-y-5" onSubmit={handleRegister}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                                    <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                                    <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                                    <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">What is your primary goal?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[{ id: "lose", label: "Lose Weight" }, { id: "gain", label: "Gain Muscle" }, { id: "maintain", label: "Maintain Fit" }].map((item) => (
                                        <button type="button" key={item.id} onClick={() => setGoal(item.id)} className={`flex items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${goal === item.id ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-slate-400"}`}>{item.label}</button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-primary font-bold py-4 rounded-lg hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-white shadow-primary/40 disabled:opacity-60">
                                {loading ? "Creating..." : "Create Account"}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <footer className="px-6 py-8 text-center text-slate-500 text-sm">© 2024 Peak Fit. All rights reserved.</footer>
        </div>
    );
}
