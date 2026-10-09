"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false); // ✅ FIX

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(
                "/api/auth/login", // ✅ FIXED
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // ✅ VERY IMPORTANT
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            if (!res.ok) {
                alert("Invalid email or password");
                return;
            }

            const data = await res.json();

            // ❌ REMOVED localStorage/sessionStorage (cookie handles auth)

            router.push("/dashboard");

        } catch (error) {
            console.error(error);
            alert("Login failed. Please try again.");
        }
    };

    return (
        <main className="flex min-h-screen flex-col lg:flex-row overflow-hidden bg-black text-slate-100">

            {/* LEFT SIDE IMAGE */}
            <section className="relative lg:w-7/12 w-full h-64 lg:h-screen overflow-hidden flex items-end p-8 lg:p-16">

                <div className="absolute inset-0 z-0">

                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsF9DHyh3CIhbERrHEDYIHZFKa8eIQuQkvMbq1eH-rce07DDtjstw-CmPIYrISEK4mo1_o-0xCMw4_tIsjUeP9Iu2NLv1LNhOvxKJsBlA8GWnIRUxfyXCQrWP0DCOD2BFtHPLYwQ6gDrCjaIEruPSqnJHZrlPdTz1e9LsvFUW8QQ1kIf-znuXe0ibrmiXvZ2ek6cxAiBYOUgeyy9dj7-kofU0yr4HbNyYu39EL5n5rgBfSzWZa4q2n6FObWj0ioG78hNBFQRidanaB"
                        className="w-full h-full object-cover grayscale brightness-50"
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

                </div>

                <div className="relative z-10 max-w-2xl">

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-1 bg-primary"></div>
                        <span className="tracking-[0.2em] font-bold text-sm uppercase">
                            Peak Fit
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-7xl font-extrabold leading-[1.1] mb-4 tracking-tighter">
                        Welcome back to your{" "}
                        <span className="text-primary">
                            Peak Performance
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg lg:text-xl font-bold tracking-[0.15em] uppercase border-l-2 border-primary pl-4">
                        ASCEND HIGHER
                    </p>

                </div>
            </section>

            {/* LOGIN FORM */}
            <section className="lg:w-5/12 w-full flex items-center justify-center p-6 lg:p-12 bg-black">

                <div className="w-full max-w-md space-y-8">

                    <header className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Login to your account
                        </h2>

                        <p className="text-slate-400">
                            Enter your credentials to access your dashboard
                        </p>
                    </header>

                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-4">

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 focus:ring-1 focus:ring-primary px-4 py-4 rounded-lg outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 focus:ring-1 focus:ring-primary px-4 py-4 rounded-lg outline-none"
                                />
                            </div>

                        </div>

                        {/* ✅ FIXED CHECKBOX */}
                        <div className="flex items-center justify-between">

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-5 h-5 bg-white/5 rounded"
                                />
                                <span className="text-sm text-slate-400">
                                    Remember me
                                </span>
                            </label>

                            <a
                                href="#"
                                className="text-sm font-bold text-primary hover:underline"
                            >
                                Forgot password?
                            </a>

                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-red-800 font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-all"
                        >
                            Login
                            <span className="material-symbols-outlined">
                                arrow_forward
                            </span>
                        </button>

                    </form>

                    <footer className="pt-8 text-center">
                        <p className="text-slate-400">
                            Don't have an account?
                            <a
                                href="/auth/register"
                                className="text-white font-bold hover:text-primary ml-1"
                            >
                                Sign Up
                            </a>
                        </p>
                    </footer>

                </div>

            </section>

        </main>
    );
}