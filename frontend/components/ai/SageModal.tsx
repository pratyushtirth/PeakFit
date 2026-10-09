"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import BodyMap, { SelectedMuscle } from "@/components/ai/BodyMap";

interface Message {
    role: "user" | "sage";
    text: string;
}

interface SageModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SageModal({ open, onClose }: SageModalProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        { role: "sage", text: "Welcome back, Champion. I'm Sage.\n\nSelect the muscle groups where you feel pain on the body map, then describe your symptoms. I'll create a modified workout plan that protects your injuries while keeping you on track." }
    ]);
    const [input, setInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [selectedMuscles, setSelectedMuscles] = useState<SelectedMuscle[]>([]);
    const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("moderate");
    const [generatingPlan, setGeneratingPlan] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const msgsRef = useRef<HTMLDivElement>(null);

    // Scroll messages area (not whole page) when new message arrives
    useEffect(() => {
        if (msgsRef.current) {
            msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
        }
    }, [messages, chatLoading]);

    // ESC key + scroll lock
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = "hidden";
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handler);
        };
    }, [open, onClose]);

    const toggleMuscle = useCallback((muscle: SelectedMuscle) => {
        setSelectedMuscles(prev =>
            prev.some(m => m.id === muscle.id)
                ? prev.filter(m => m.id !== muscle.id)
                : [...prev, muscle]
        );
    }, []);

    const sendMessage = async (text?: string) => {
        const msg = (text || input).trim();
        if (!msg) return;
        setMessages(prev => [...prev, { role: "user", text: msg }]);
        setInput("");
        setChatLoading(true);
        try {
            const history = messages.slice(-6)
                .map(m => `${m.role === "user" ? "User" : "Sage"}: ${m.text}`)
                .join("\n");
            const res = await fetch("/api/sage/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: msg, conversationHistory: history }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: "sage",
                text: data.reply || "I'm having trouble responding. Please try again."
            }]);
        } catch (e: any) {
            const msg = (e?.message || "").toLowerCase();
            let errText = "I'm having trouble responding right now. Please try again.";
            if (msg.includes("rate_limited") || msg.includes("rate limit") || msg.includes("daily limit")) {
                errText = "⏳ Daily AI limit reached — please wait a few minutes before sending another message.";
            } else if (msg.includes("model_busy") || msg.includes("503") || msg.includes("502") || msg.includes("busy")) {
                errText = "⚠️ The AI provider is temporarily busy. Please send your message again in a moment.";
            } else if (msg.includes("401") || msg.includes("api key") || msg.includes("unauthorized")) {
                errText = "🔑 API key issue — check the OPENROUTER_API_KEY environment variable.";
            } else if (msg.includes("timeout") || msg.includes("network")) {
                errText = "🌐 Network timeout — please check your connection and try again.";
            }
            setMessages(prev => [...prev, { role: "sage", text: errText }]);
        } finally {
            setChatLoading(false);
        }
    };

    const generateAdjustedPlan = async () => {
        if (selectedMuscles.length === 0) return;
        setGeneratingPlan(true);
        const injuredList = selectedMuscles.map(m => m.label).join(", ");
        setMessages(prev => [...prev, {
            role: "user",
            text: `Generate an injury-adjusted workout plan. Affected areas: ${injuredList}. Severity: ${severity}.`
        }]);
        try {
            const res = await fetch("/api/sage/adjust-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    injuredMuscles: injuredList,
                    injurySeverity: severity,
                    requestAdjustedPlan: true,
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                let errMsg = "Recovery plan generation failed.";
                try { const p = JSON.parse(errText); if (p?.error) errMsg = p.error; } catch {}
                throw new Error(errMsg);
            }
            const data = await res.json();
            if (data.plan) {
                try {
                    const plan = JSON.parse(data.plan);

                    // FIX: Store plan in localStorage so workouts page can load it
                    localStorage.setItem("peakfit_active_plan", JSON.stringify(plan));

                    const summary = `✅ Modified plan generated — **${plan.planName}**\n\n${plan.description}\n\n${plan.injuryNote ? `⚠️ ${plan.injuryNote}\n\n` : ""}Redirecting you to the workout page now...`;
                    setMessages(prev => [...prev, { role: "sage", text: summary }]);

                    // FIX: Navigate to workouts page after short delay so user sees the message
                    setTimeout(() => {
                        onClose();
                        router.push("/dashboard/workouts");
                    }, 1800);
                } catch {
                    setMessages(prev => [...prev, { role: "sage", text: data.plan }]);
                }
            }
        } catch (e: any) {
            const msg = (e?.message || "").toLowerCase();
            let errText = "❌ Couldn't generate a recovery plan right now. Please try again.";
            if (msg.includes("rate_limited") || msg.includes("rate limit") || msg.includes("daily limit")) {
                errText = "⏳ Daily AI limit reached — please wait a few minutes before generating a recovery plan.";
            } else if (msg.includes("model_busy") || msg.includes("503") || msg.includes("busy")) {
                errText = "⚠️ The AI provider is temporarily busy. Please click Generate Recovery Plan again.";
            }
            setMessages(prev => [...prev, { role: "sage", text: errText }]);
        } finally {
            setGeneratingPlan(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* FIX: Single className, proper flex layout, overflow-hidden */}
            <div
                className="w-full max-w-5xl rounded-2xl overflow-hidden flex bg-[#0c0c0c] border border-[#1f1f1f]"
                style={{ height: "88vh", animation: "sageModalIn 0.25s ease" }}
            >
                {/* ── LEFT: BODY MAP — flex-1 so it takes remaining space ── */}
                <div className="flex-1 flex flex-col bg-[#080808] border-r border-[#1a1a1a] p-5 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-start mb-2 flex-shrink-0">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Locate Your Pain</h2>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Select affected muscle groups</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:border-primary/40 hover:text-red-400 transition-all"
                        >
                            ✕ Close
                        </button>
                    </div>
                    {/* Body map fills remaining height, never overflows */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <BodyMap selected={selectedMuscles} onToggle={toggleMuscle} />
                    </div>
                </div>

                {/* ── RIGHT: CHAT PANEL — fixed width, flex column, overflow-hidden ── */}
                <div className="w-[360px] flex-shrink-0 flex flex-col bg-[#0a0a0a] overflow-hidden">

                    {/* Header — never shrinks */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#9e0000,#6b0000)" }}
                    >
                        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base flex-shrink-0">🌿</div>
                        <div>
                            <div className="text-sm font-black text-white">Sage AI</div>
                            <div className="text-[10px] text-white/60">Recovery Specialist</div>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[9px] text-white/50">Online</span>
                        </div>
                    </div>

                    {/* FIX: Messages — flex-1 + overflow-y-auto + min-h-0 = ONLY this scrolls */}
                    <div
                        ref={msgsRef}
                        className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
                    >
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                {m.role === "sage" && (
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs flex-shrink-0 mt-1">🌿</div>
                                )}
                                <div className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                                    m.role === "user"
                                        ? "bg-primary/25 border border-primary/30 text-red-200 rounded-br-none"
                                        : "bg-[#141414] border border-white/6 text-slate-300 rounded-bl-none"
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">🌿</div>
                                <div className="bg-[#141414] border border-white/6 rounded-xl rounded-bl-none px-3 py-3">
                                    <div className="flex gap-1">
                                        {[0,150,300].map(d => (
                                            <span key={d} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Pain Severity — flex-shrink-0 so it never disappears */}
                    <div className="px-3 py-2 border-t border-[#1a1a1a] flex-shrink-0">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-2">Select Pain Severity</p>
                        <div className="flex gap-2">
                            {(["mild", "moderate", "severe"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSeverity(s)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                                        severity === s
                                            ? "border-primary bg-primary/15 text-red-400"
                                            : "border-white/10 text-slate-500 bg-transparent"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected Areas — flex-shrink-0 */}
                    <div className="px-3 py-2 border-t border-[#1a1a1a] flex-shrink-0">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-2">Selected Areas</p>
                        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                            {selectedMuscles.length === 0 ? (
                                <span className="text-[10px] text-slate-600 border border-dashed border-white/10 px-2 py-0.5 rounded-full">+ Select from body map</span>
                            ) : (
                                selectedMuscles.map(m => (
                                    <span key={m.id} className="inline-flex items-center gap-1 bg-primary/18 border border-primary/40 text-red-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        {m.label}
                                        <button onClick={() => toggleMuscle(m)} className="opacity-60 hover:opacity-100 ml-0.5">×</button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Input + Generate — flex-shrink-0 */}
                    <div className="p-3 border-t border-[#1a1a1a] flex-shrink-0">
                        <div className="flex gap-2 mb-2">
                            <textarea
                                rows={2}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder="Describe your symptoms (e.g. sharp pain when lifting)..."
                                className="flex-1 bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none resize-none placeholder:text-slate-600 focus:border-primary/50"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={chatLoading || !input.trim()}
                                className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:bg-red-800 transition-colors flex-shrink-0 self-end"
                            >
                                <span className="material-symbols-outlined text-base">send</span>
                            </button>
                        </div>
                        <button
                            onClick={generateAdjustedPlan}
                            disabled={selectedMuscles.length === 0 || generatingPlan}
                            className="w-full bg-primary hover:bg-red-800 disabled:bg-[#1a0a0a] disabled:text-[#3a1a1a] disabled:cursor-not-allowed text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-base">bolt</span>
                            {generatingPlan ? "Generating..." : "Generate Recovery Plan"}
                        </button>
                        <p className="text-[8px] text-slate-700 text-center mt-2">AI results should be reviewed with a medical professional.</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes sageModalIn {
                    from { transform: scale(0.96); opacity: 0; }
                    to   { transform: scale(1);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}
