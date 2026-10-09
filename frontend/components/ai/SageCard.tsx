"use client";

interface SageCardProps {
    onOpen: () => void;
}

export default function SageCard({ onOpen }: SageCardProps) {
    return (
        <div
            onClick={onOpen}
            className="sage-entry-card relative overflow-hidden rounded-2xl border border-primary/35 cursor-pointer group transition-all duration-300 hover:border-primary/70 hover:shadow-primary-glow"
            style={{ background: "linear-gradient(135deg, #0d0000 0%, #1a0000 40%, #0a0000 100%)" }}
        >
            {/* Glow orb */}
            <div
                className="absolute -top-10 -right-10 w-44 h-44 pointer-events-none rounded-full"
                style={{ background: "radial-gradient(circle, rgba(158,0,0,0.14) 0%, transparent 70%)" }}
            />

            <div className="relative flex justify-between items-center px-6 py-5 gap-5">
                <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/40 text-red-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                        <span className="sage-pulse-dot w-1.5 h-1.5 rounded-full bg-red-500" />
                        AI Powered
                    </div>
                    <h3 className="text-lg font-black tracking-tight">SAGE AI</h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
                        Your AI Fitness &amp; Recovery Coach — personalized workouts, injury guidance, and modified plans.
                    </p>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); onOpen(); }}
                    className="bg-primary hover:bg-red-800 text-white font-black text-xs px-5 py-3 rounded-xl flex-shrink-0 transition-all group-hover:scale-105"
                >
                    Interact with Sage →
                </button>
            </div>
        </div>
    );
}
