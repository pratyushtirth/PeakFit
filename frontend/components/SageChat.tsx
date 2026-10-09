"use client";

import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "sage"; text: string; }

const MUSCLE_GROUPS = [
    { id: "neck", label: "Neck", cx: 200, cy: 55, r: 14 },
    { id: "chest", label: "Chest", cx: 200, cy: 115, r: 22 },
    { id: "left-shoulder", label: "Left Shoulder", cx: 155, cy: 100, r: 16 },
    { id: "right-shoulder", label: "Right Shoulder", cx: 245, cy: 100, r: 16 },
    { id: "left-bicep", label: "Left Bicep", cx: 135, cy: 135, r: 14 },
    { id: "right-bicep", label: "Right Bicep", cx: 265, cy: 135, r: 14 },
    { id: "core", label: "Core / Abs", cx: 200, cy: 155, r: 20 },
    { id: "left-forearm", label: "Left Forearm", cx: 120, cy: 175, r: 12 },
    { id: "right-forearm", label: "Right Forearm", cx: 280, cy: 175, r: 12 },
    { id: "lower-back", label: "Lower Back", cx: 200, cy: 195, r: 18 },
    { id: "left-glute", label: "Left Glute", cx: 181, cy: 230, r: 16 },
    { id: "right-glute", label: "Right Glute", cx: 219, cy: 230, r: 16 },
    { id: "left-quad", label: "Left Quad", cx: 175, cy: 270, r: 16 },
    { id: "right-quad", label: "Right Quad", cx: 225, cy: 270, r: 16 },
    { id: "left-hamstring", label: "Left Hamstring", cx: 175, cy: 310, r: 14 },
    { id: "right-hamstring", label: "Right Hamstring", cx: 225, cy: 310, r: 14 },
    { id: "left-knee", label: "Left Knee", cx: 175, cy: 345, r: 12 },
    { id: "right-knee", label: "Right Knee", cx: 225, cy: 345, r: 12 },
    { id: "left-calf", label: "Left Calf", cx: 175, cy: 380, r: 13 },
    { id: "right-calf", label: "Right Calf", cx: 225, cy: 380, r: 13 },
];

export default function SageChat() {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<"chat" | "body">("chat");
    const [messages, setMessages] = useState<Message[]>([
        { role: "sage", text: "Hey! I'm Sage 🌿 — your AI fitness assistant. Ask me anything about your workouts, or tap the body map to report pain or injury and I'll adjust your routine." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
    const [generatingPlan, setGeneratingPlan] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const toggleMuscle = (id: string) => {
        setSelectedMuscles(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg && selectedMuscles.length === 0) return;
        const userText = msg || `I have ${severity} pain in: ${selectedMuscles.join(", ")}`;
        setMessages(prev => [...prev, { role: "user", text: userText }]);
        setInput(""); setLoading(true);
        try {
            const history = messages.slice(-6).map(m => `${m.role === "user" ? "User" : "Sage"}: ${m.text}`).join("\n");
            const res = await fetch("/api/sage/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: userText, conversationHistory: history }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "sage", text: data.reply || "I'm having trouble responding. Please try again." }]);
        } catch {
            setMessages(prev => [...prev, { role: "sage", text: "I'm offline right now. Make sure the backend is running with a valid API key." }]);
        } finally {
            setLoading(false);
        }
    };

    const generateAdjustedPlan = async () => {
        if (selectedMuscles.length === 0) return;
        setGeneratingPlan(true);
        setView("chat");
        const injuredList = selectedMuscles.map(id => MUSCLE_GROUPS.find(m => m.id === id)?.label || id).join(", ");
        setMessages(prev => [...prev, { role: "user", text: `Generate an injury-adjusted workout plan for me. Affected areas: ${injuredList}. Severity: ${severity}.` }]);
        try {
            const res = await fetch("/api/sage/adjust-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ injuredMuscles: injuredList, injurySeverity: severity, requestAdjustedPlan: true }),
            });
            const data = await res.json();
            if (data.plan) {
                try {
                    const plan = JSON.parse(data.plan);
                    const summary = `Here's your adjusted plan — **${plan.planName}**\n\n${plan.description}\n\n${plan.injuryNote ? `⚠️ ${plan.injuryNote}\n\n` : ""}${plan.days?.map((d: any) => `**${d.day}:**\n${d.exercises?.map((e: any) => `• ${e.name} — ${e.sets}×${e.reps} (${e.rest}) ${e.notes ? "— " + e.notes : ""}`).join("\n")}`).join("\n\n")}`;
                    setMessages(prev => [...prev, { role: "sage", text: summary }]);
                } catch {
                    setMessages(prev => [...prev, { role: "sage", text: data.plan }]);
                }
            }
        } catch {
            setMessages(prev => [...prev, { role: "sage", text: "Couldn't generate an adjusted plan right now. Please try again." }]);
        } finally {
            setGeneratingPlan(false);
            setSelectedMuscles([]);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button onClick={() => setOpen(o => !o)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:bg-red-700 transition-all hover:scale-105">
                <span className="material-symbols-outlined text-white text-2xl">{open ? "close" : "smart_toy"}</span>
            </button>

            {/* Chat Panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-red-800 p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-lg">eco</span>
                            </div>
                            <div>
                                <p className="font-black text-white">Sage</p>
                                <p className="text-white/70 text-xs">AI Fitness Assistant</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setView("chat")} className={`text-xs px-3 py-1 rounded-full transition-all ${view === "chat" ? "bg-white/30 text-white" : "text-white/60 hover:text-white"}`}>Chat</button>
                            <button onClick={() => setView("body")} className={`text-xs px-3 py-1 rounded-full transition-all ${view === "body" ? "bg-white/30 text-white" : "text-white/60 hover:text-white"}`}>Body Map</button>
                        </div>
                    </div>

                    {view === "chat" ? (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "bg-primary text-white rounded-br-none" : "bg-white/8 text-slate-200 rounded-bl-none border border-white/10"}`}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>
                            {/* Suggestions */}
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0">
                                {["My lower back hurts", "Best chest exercises", "Am I overtraining?"].map(s => (
                                    <button key={s} onClick={() => sendMessage(s)} className="text-xs whitespace-nowrap bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-slate-400 hover:text-white hover:border-primary/50 transition-all shrink-0">{s}</button>
                                ))}
                            </div>
                            {/* Input */}
                            <div className="p-4 border-t border-white/10 flex gap-2 shrink-0">
                                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && sendMessage()} placeholder="Ask Sage anything..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600" />
                                <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-40">
                                    <span className="material-symbols-outlined text-white text-lg">send</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Body Map View */
                        <div className="flex-1 overflow-y-auto p-4 min-h-0">
                            <p className="text-xs text-slate-400 mb-3 text-center">Tap the areas where you feel pain or discomfort</p>
                            <div className="flex justify-center">
                                <svg viewBox="0 0 400 420" className="w-full max-w-[260px]" xmlns="http://www.w3.org/2000/svg">
                                    {/* Body silhouette */}
                                    <ellipse cx="200" cy="38" rx="24" ry="26" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <rect x="165" y="62" width="70" height="145" rx="12" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <ellipse cx="200" cy="62" rx="35" ry="18" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <rect x="118" y="80" width="48" height="115" rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <rect x="234" y="80" width="48" height="115" rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <rect x="168" y="207" width="28" height="130" rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <rect x="204" y="207" width="28" height="130" rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <rect x="168" y="335" width="22" height="70" rx="8" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    <rect x="210" y="335" width="22" height="70" rx="8" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
                                    {/* Clickable muscle zones */}
                                    {MUSCLE_GROUPS.map(m => (
                                        <circle key={m.id} cx={m.cx} cy={m.cy} r={m.r}
                                            fill={selectedMuscles.includes(m.id) ? "#9e0000" : "transparent"}
                                            stroke={selectedMuscles.includes(m.id) ? "#ff4444" : "#444"}
                                            strokeWidth="1.5"
                                            className="cursor-pointer transition-all hover:stroke-primary"
                                            onClick={() => toggleMuscle(m.id)}
                                        >
                                            <title>{m.label}</title>
                                        </circle>
                                    ))}
                                </svg>
                            </div>

                            {selectedMuscles.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Selected areas:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedMuscles.map(id => {
                                                const m = MUSCLE_GROUPS.find(g => g.id === id);
                                                return (
                                                    <span key={id} className="text-xs bg-primary/20 border border-primary/30 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        {m?.label}
                                                        <button onClick={() => toggleMuscle(id)} className="text-primary/70 hover:text-white">×</button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-2">Pain severity:</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(["mild", "moderate", "severe"] as const).map(s => (
                                                <button key={s} onClick={() => setSeverity(s)} className={`py-2 rounded-lg text-xs font-bold capitalize transition-all border ${severity === s ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-slate-400"}`}>{s}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => sendMessage(`I have ${severity} pain in: ${selectedMuscles.map(id => MUSCLE_GROUPS.find(m => m.id === id)?.label).join(", ")}`)} className="w-full bg-white/5 border border-white/10 py-2.5 rounded-xl text-sm font-medium hover:border-primary/50 transition-all">
                                        💬 Ask Sage for advice
                                    </button>
                                    <button onClick={generateAdjustedPlan} disabled={generatingPlan} className="w-full bg-primary py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-60">
                                        {generatingPlan ? "Generating..." : "⚡ Generate Adjusted Plan"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
