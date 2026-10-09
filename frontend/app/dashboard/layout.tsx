"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SageChat from "@/components/SageChat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Floating SageChat hidden ONLY on /dashboard, shown on all other dashboard pages
    const showFloatingChat = pathname !== "/dashboard";

    return (
        <div className="flex h-screen bg-black text-slate-100 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
            {showFloatingChat && <SageChat />}
        </div>
    );
}
