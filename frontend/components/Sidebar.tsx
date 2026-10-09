"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "bolt" },
    { name: "Generate Workout", href: "/dashboard/workouts", icon: "fitness_center" },
    { name: "Exercise Library", href: "/dashboard/library", icon: "menu_book" },
    { name: "Progress Tracker", href: "/dashboard/progress", icon: "trending_up" },
    { name: "Workout History", href: "/dashboard/history", icon: "history" },
];

const accountItems = [
    { name: "Profile", href: "/dashboard/profile", icon: "person" },
    { name: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const linkClasses = (href: string) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === href
                ? "bg-primary text-white font-bold"
                : "text-slate-400 hover:text-primary hover:bg-primary/10"
        }`;

    // ✅ FIXED: properly call logout API to clear the httpOnly cookie
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (e) {
            console.error(e);
        } finally {
            // Clear all localStorage plan keys so next user starts fresh
            localStorage.removeItem("peakfit_active_plan");
            localStorage.removeItem("peakfit_today_day_index");
            localStorage.removeItem("peakfit_day_logged");
            localStorage.removeItem("peakfit_weight_log");
            router.push("/auth/login");
        }
    };

    return (
        <aside className="w-72 h-screen sticky top-0 bg-[#0a0a0a] border-r border-primary/10 flex flex-col justify-between p-6 shrink-0">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">bolt</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">Peak Fit</h1>
                        <p className="text-primary text-xs uppercase tracking-widest">Elite Performance</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="pt-4 border-t border-slate-800">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Account</p>
                    <nav className="flex flex-col gap-1">
                        {accountItems.map((item) => (
                            <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all mt-auto">
                <span className="material-symbols-outlined">logout</span>
                <span className="text-sm font-bold">Logout</span>
            </button>
        </aside>
    );
}
