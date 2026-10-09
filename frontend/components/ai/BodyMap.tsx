"use client";

import { useState } from "react";

export interface SelectedMuscle {
    id: string;
    label: string;
}

interface BodyMapProps {
    selected: SelectedMuscle[];
    onToggle: (muscle: SelectedMuscle) => void;
}

type View = "front" | "back";

// All clickable muscle groups with their SVG data-names
const FRONT_MUSCLES = [
    { id: "left-shoulder", label: "Left Shoulder" },
    { id: "right-shoulder", label: "Right Shoulder" },
    { id: "chest", label: "Chest" },
    { id: "abs", label: "Abs / Core" },
    { id: "left-bicep", label: "Left Bicep" },
    { id: "right-bicep", label: "Right Bicep" },
    { id: "left-forearm", label: "Left Forearm" },
    { id: "right-forearm", label: "Right Forearm" },
    { id: "left-quad", label: "Left Quad" },
    { id: "right-quad", label: "Right Quad" },
    { id: "left-knee", label: "Left Knee" },
    { id: "right-knee", label: "Right Knee" },
    { id: "left-calf", label: "Left Calf" },
    { id: "right-calf", label: "Right Calf" },
];

const BACK_MUSCLES = [
    { id: "traps", label: "Traps" },
    { id: "left-rear-delt", label: "Left Rear Delt" },
    { id: "right-rear-delt", label: "Right Rear Delt" },
    { id: "lats", label: "Lats" },
    { id: "lower-back", label: "Lower Back" },
    { id: "left-tricep", label: "Left Tricep" },
    { id: "right-tricep", label: "Right Tricep" },
    { id: "left-glute", label: "Left Glute" },
    { id: "right-glute", label: "Right Glute" },
    { id: "left-hamstring", label: "Left Hamstring" },
    { id: "right-hamstring", label: "Right Hamstring" },
    { id: "left-calf-b", label: "Left Calf" },
    { id: "right-calf-b", label: "Right Calf" },
];

export default function BodyMap({ selected, onToggle }: BodyMapProps) {
    const [view, setView] = useState<View>("front");
    const [hovered, setHovered] = useState<string>("");

    const isSelected = (id: string) => selected.some(s => s.id === id);

    const muscleStyle = (id: string) => ({
        fill: isSelected(id) ? "rgba(200,0,0,0.75)" : "rgba(160,50,50,0.18)",
        filter: isSelected(id) ? "drop-shadow(0 0 9px rgba(255,0,0,0.65))" : hovered === id ? "brightness(1.6) drop-shadow(0 0 7px rgba(255,60,60,0.55))" : undefined,
        cursor: "pointer" as const,
        transition: "all 0.25s",
    });

    const strokeStyle = (id: string) => ({
        stroke: isSelected(id) || hovered === id ? "#ff3333" : "rgba(160,50,50,0.55)",
        strokeWidth: isSelected(id) || hovered === id ? 1.4 : 1.1,
        fill: "none" as const,
        cursor: "pointer" as const,
    });

    const handleClick = (id: string, label: string) => {
        onToggle({ id, label });
    };

    return (
        <div className="flex flex-col h-full">
            {/* View Toggle */}
            <div className="flex gap-2 mb-3 flex-shrink-0">
                <button
                    onClick={() => setView("front")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${view === "front" ? "bg-primary/15 border-primary/50 text-red-400" : "border-white/10 text-slate-500 bg-transparent"}`}
                >
                    Front View
                </button>
                <button
                    onClick={() => setView("back")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${view === "back" ? "bg-primary/15 border-primary/50 text-red-400" : "border-white/10 text-slate-500 bg-transparent"}`}
                >
                    Back View
                </button>
            </div>

            {/* Hover Label */}
            <div className="h-6 flex items-center justify-center mb-1 flex-shrink-0">
                {hovered && (
                    <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-900/40 px-3 py-1 rounded-full">
                        {[...FRONT_MUSCLES, ...BACK_MUSCLES].find(m => m.id === hovered)?.label}
                    </span>
                )}
            </div>

            {/* SVG Canvas */}
            <div className="flex-1 flex justify-center items-center overflow-hidden">
                {view === "front" ? (
                    <svg width="200" height="440" viewBox="0 0 210 460" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="bg1" cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#2d2d2d"/><stop offset="100%" stopColor="#181818"/></radialGradient>
                            <radialGradient id="bg2" cx="50%" cy="30%" r="60%"><stop offset="0%" stopColor="#262626"/><stop offset="100%" stopColor="#141414"/></radialGradient>
                        </defs>
                        {/* Silhouette */}
                        <ellipse cx="105" cy="30" rx="24" ry="28" fill="url(#bg1)" stroke="#2d2d2d" strokeWidth="1.2"/>
                        <rect x="97" y="55" width="16" height="18" rx="4" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1"/>
                        <path d="M72 72 Q105 64 138 72 L142 188 Q105 196 68 188Z" fill="url(#bg1)" stroke="#2d2d2d" strokeWidth="1.2"/>
                        <path d="M72 74 Q58 78 52 86 L46 148 Q56 154 66 150 L74 90Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M138 74 Q152 78 158 86 L164 148 Q154 154 144 150 L136 90Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M46 148 Q40 153 39 160 L41 210 Q50 215 60 211 L64 154Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M164 148 Q170 153 171 160 L169 210 Q160 215 150 211 L146 154Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <ellipse cx="47" cy="222" rx="10" ry="14" fill="#181818" stroke="#252525" strokeWidth="1"/>
                        <ellipse cx="163" cy="222" rx="10" ry="14" fill="#181818" stroke="#252525" strokeWidth="1"/>
                        <path d="M68 188 Q84 194 98 196 L100 305 Q86 312 72 308 L62 200Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M142 188 Q126 194 112 196 L110 305 Q124 312 138 308 L148 200Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M72 308 Q84 314 98 310 L100 395 Q86 403 70 399 L66 312Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M138 308 Q126 314 112 310 L110 395 Q124 403 140 399 L144 312Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <ellipse cx="84" cy="408" rx="18" ry="9" fill="#181818" stroke="#252525" strokeWidth="1"/>
                        <ellipse cx="126" cy="408" rx="18" ry="9" fill="#181818" stroke="#252525" strokeWidth="1"/>

                        {/* LEFT SHOULDER */}
                        <g onClick={() => handleClick("left-shoulder","Left Shoulder")} onMouseEnter={() => setHovered("left-shoulder")} onMouseLeave={() => setHovered("")}>
                            <path d="M72 74 Q60 70 50 80 Q44 92 48 106 Q58 100 68 93 L74 82Z" style={muscleStyle("left-shoulder")}/>
                            <path d="M72 74 Q60 70 50 80 Q44 92 48 106 Q58 100 68 93 L74 82Z" style={strokeStyle("left-shoulder")}/>
                        </g>
                        {/* RIGHT SHOULDER */}
                        <g onClick={() => handleClick("right-shoulder","Right Shoulder")} onMouseEnter={() => setHovered("right-shoulder")} onMouseLeave={() => setHovered("")}>
                            <path d="M138 74 Q150 70 160 80 Q166 92 162 106 Q152 100 142 93 L136 82Z" style={muscleStyle("right-shoulder")}/>
                            <path d="M138 74 Q150 70 160 80 Q166 92 162 106 Q152 100 142 93 L136 82Z" style={strokeStyle("right-shoulder")}/>
                        </g>
                        {/* CHEST */}
                        <g onClick={() => handleClick("chest","Chest")} onMouseEnter={() => setHovered("chest")} onMouseLeave={() => setHovered("")}>
                            <path d="M76 74 Q103 68 130 74 L128 108 Q103 115 78 108Z" style={muscleStyle("chest")}/>
                            <path d="M76 74 Q103 68 130 74 L128 108 Q103 115 78 108Z" style={strokeStyle("chest")}/>
                            <line x1="105" y1="70" x2="105" y2="112" stroke="rgba(160,50,50,0.25)" strokeWidth=".7" pointerEvents="none"/>
                        </g>
                        {/* ABS */}
                        <g onClick={() => handleClick("abs","Abs / Core")} onMouseEnter={() => setHovered("abs")} onMouseLeave={() => setHovered("")}>
                            <path d="M82 110 Q105 104 128 110 L126 184 Q105 190 84 184Z" style={muscleStyle("abs")}/>
                            <path d="M82 110 Q105 104 128 110 L126 184 Q105 190 84 184Z" style={strokeStyle("abs")}/>
                            <line x1="105" y1="106" x2="105" y2="188" stroke="rgba(160,50,50,0.2)" strokeWidth=".7" pointerEvents="none"/>
                            <path d="M83 133 Q105 127 127 133" stroke="rgba(160,50,50,0.2)" strokeWidth=".7" fill="none" pointerEvents="none"/>
                            <path d="M83 155 Q105 149 127 155" stroke="rgba(160,50,50,0.2)" strokeWidth=".7" fill="none" pointerEvents="none"/>
                            <path d="M83 175 Q105 169 127 175" stroke="rgba(160,50,50,0.2)" strokeWidth=".7" fill="none" pointerEvents="none"/>
                        </g>
                        {/* LEFT BICEP */}
                        <g onClick={() => handleClick("left-bicep","Left Bicep")} onMouseEnter={() => setHovered("left-bicep")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="52" cy="118" rx="11" ry="22" style={muscleStyle("left-bicep")}/>
                            <ellipse cx="52" cy="118" rx="11" ry="22" style={strokeStyle("left-bicep")}/>
                        </g>
                        {/* RIGHT BICEP */}
                        <g onClick={() => handleClick("right-bicep","Right Bicep")} onMouseEnter={() => setHovered("right-bicep")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="158" cy="118" rx="11" ry="22" style={muscleStyle("right-bicep")}/>
                            <ellipse cx="158" cy="118" rx="11" ry="22" style={strokeStyle("right-bicep")}/>
                        </g>
                        {/* LEFT FOREARM */}
                        <g onClick={() => handleClick("left-forearm","Left Forearm")} onMouseEnter={() => setHovered("left-forearm")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="48" cy="180" rx="10" ry="22" style={muscleStyle("left-forearm")}/>
                            <ellipse cx="48" cy="180" rx="10" ry="22" style={strokeStyle("left-forearm")}/>
                        </g>
                        {/* RIGHT FOREARM */}
                        <g onClick={() => handleClick("right-forearm","Right Forearm")} onMouseEnter={() => setHovered("right-forearm")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="162" cy="180" rx="10" ry="22" style={muscleStyle("right-forearm")}/>
                            <ellipse cx="162" cy="180" rx="10" ry="22" style={strokeStyle("right-forearm")}/>
                        </g>
                        {/* LEFT QUAD */}
                        <g onClick={() => handleClick("left-quad","Left Quad")} onMouseEnter={() => setHovered("left-quad")} onMouseLeave={() => setHovered("")}>
                            <path d="M64 198 Q80 193 96 198 L98 300 Q80 307 62 302Z" style={muscleStyle("left-quad")}/>
                            <path d="M64 198 Q80 193 96 198 L98 300 Q80 307 62 302Z" style={strokeStyle("left-quad")}/>
                        </g>
                        {/* RIGHT QUAD */}
                        <g onClick={() => handleClick("right-quad","Right Quad")} onMouseEnter={() => setHovered("right-quad")} onMouseLeave={() => setHovered("")}>
                            <path d="M146 198 Q130 193 114 198 L112 300 Q130 307 148 302Z" style={muscleStyle("right-quad")}/>
                            <path d="M146 198 Q130 193 114 198 L112 300 Q130 307 148 302Z" style={strokeStyle("right-quad")}/>
                        </g>
                        {/* LEFT KNEE */}
                        <g onClick={() => handleClick("left-knee","Left Knee")} onMouseEnter={() => setHovered("left-knee")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="80" cy="310" rx="16" ry="9" style={muscleStyle("left-knee")}/>
                            <ellipse cx="80" cy="310" rx="16" ry="9" style={strokeStyle("left-knee")}/>
                        </g>
                        {/* RIGHT KNEE */}
                        <g onClick={() => handleClick("right-knee","Right Knee")} onMouseEnter={() => setHovered("right-knee")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="130" cy="310" rx="16" ry="9" style={muscleStyle("right-knee")}/>
                            <ellipse cx="130" cy="310" rx="16" ry="9" style={strokeStyle("right-knee")}/>
                        </g>
                        {/* LEFT CALF */}
                        <g onClick={() => handleClick("left-calf","Left Calf")} onMouseEnter={() => setHovered("left-calf")} onMouseLeave={() => setHovered("")}>
                            <path d="M66 320 Q80 315 96 320 L94 390 Q80 397 64 393Z" style={muscleStyle("left-calf")}/>
                            <path d="M66 320 Q80 315 96 320 L94 390 Q80 397 64 393Z" style={strokeStyle("left-calf")}/>
                        </g>
                        {/* RIGHT CALF */}
                        <g onClick={() => handleClick("right-calf","Right Calf")} onMouseEnter={() => setHovered("right-calf")} onMouseLeave={() => setHovered("")}>
                            <path d="M144 320 Q130 315 114 320 L116 390 Q130 397 146 393Z" style={muscleStyle("right-calf")}/>
                            <path d="M144 320 Q130 315 114 320 L116 390 Q130 397 146 393Z" style={strokeStyle("right-calf")}/>
                        </g>
                    </svg>
                ) : (
                    <svg width="200" height="440" viewBox="0 0 210 460" xmlns="http://www.w3.org/2000/svg">
                        {/* Silhouette (same as front) */}
                        <ellipse cx="105" cy="30" rx="24" ry="28" fill="url(#bg1)" stroke="#2d2d2d" strokeWidth="1.2"/>
                        <rect x="97" y="55" width="16" height="18" rx="4" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1"/>
                        <path d="M72 72 Q105 64 138 72 L142 188 Q105 196 68 188Z" fill="url(#bg1)" stroke="#2d2d2d" strokeWidth="1.2"/>
                        <path d="M72 74 Q58 78 52 86 L46 148 Q56 154 66 150 L74 90Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M138 74 Q152 78 158 86 L164 148 Q154 154 144 150 L136 90Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M46 148 Q40 153 39 160 L41 210 Q50 215 60 211 L64 154Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M164 148 Q170 153 171 160 L169 210 Q160 215 150 211 L146 154Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <ellipse cx="47" cy="222" rx="10" ry="14" fill="#181818" stroke="#252525" strokeWidth="1"/>
                        <ellipse cx="163" cy="222" rx="10" ry="14" fill="#181818" stroke="#252525" strokeWidth="1"/>
                        <path d="M68 188 Q84 194 98 196 L100 305 Q86 312 72 308 L62 200Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M142 188 Q126 194 112 196 L110 305 Q124 312 138 308 L148 200Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M72 308 Q84 314 98 310 L100 395 Q86 403 70 399 L66 312Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <path d="M138 308 Q126 314 112 310 L110 395 Q124 403 140 399 L144 312Z" fill="url(#bg2)" stroke="#272727" strokeWidth="1"/>
                        <ellipse cx="84" cy="408" rx="18" ry="9" fill="#181818" stroke="#252525" strokeWidth="1"/>
                        <ellipse cx="126" cy="408" rx="18" ry="9" fill="#181818" stroke="#252525" strokeWidth="1"/>

                        {/* TRAPS */}
                        <g onClick={() => handleClick("traps","Traps")} onMouseEnter={() => setHovered("traps")} onMouseLeave={() => setHovered("")}>
                            <path d="M80 70 Q105 62 130 70 L124 95 Q105 89 86 95Z" style={muscleStyle("traps")}/>
                            <path d="M80 70 Q105 62 130 70 L124 95 Q105 89 86 95Z" style={strokeStyle("traps")}/>
                        </g>
                        {/* LEFT REAR DELT */}
                        <g onClick={() => handleClick("left-rear-delt","Left Rear Delt")} onMouseEnter={() => setHovered("left-rear-delt")} onMouseLeave={() => setHovered("")}>
                            <path d="M72 74 Q58 70 48 80 Q42 92 46 108 Q58 102 68 95 L74 84Z" style={muscleStyle("left-rear-delt")}/>
                            <path d="M72 74 Q58 70 48 80 Q42 92 46 108 Q58 102 68 95 L74 84Z" style={strokeStyle("left-rear-delt")}/>
                        </g>
                        {/* RIGHT REAR DELT */}
                        <g onClick={() => handleClick("right-rear-delt","Right Rear Delt")} onMouseEnter={() => setHovered("right-rear-delt")} onMouseLeave={() => setHovered("")}>
                            <path d="M138 74 Q152 70 162 80 Q168 92 164 108 Q152 102 142 95 L136 84Z" style={muscleStyle("right-rear-delt")}/>
                            <path d="M138 74 Q152 70 162 80 Q168 92 164 108 Q152 102 142 95 L136 84Z" style={strokeStyle("right-rear-delt")}/>
                        </g>
                        {/* LATS */}
                        <g onClick={() => handleClick("lats","Lats")} onMouseEnter={() => setHovered("lats")} onMouseLeave={() => setHovered("")}>
                            <path d="M76 93 Q103 88 130 93 L130 170 Q103 178 76 170Z" style={muscleStyle("lats")}/>
                            <path d="M76 93 Q103 88 130 93 L130 170 Q103 178 76 170Z" style={strokeStyle("lats")}/>
                            <line x1="105" y1="90" x2="105" y2="176" stroke="rgba(160,50,50,0.22)" strokeWidth=".8" pointerEvents="none"/>
                        </g>
                        {/* LOWER BACK */}
                        <g onClick={() => handleClick("lower-back","Lower Back")} onMouseEnter={() => setHovered("lower-back")} onMouseLeave={() => setHovered("")}>
                            <path d="M84 170 Q105 165 126 170 L125 188 Q105 193 85 188Z" style={muscleStyle("lower-back")}/>
                            <path d="M84 170 Q105 165 126 170 L125 188 Q105 193 85 188Z" style={strokeStyle("lower-back")}/>
                        </g>
                        {/* LEFT TRICEP */}
                        <g onClick={() => handleClick("left-tricep","Left Tricep")} onMouseEnter={() => setHovered("left-tricep")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="52" cy="116" rx="11" ry="22" style={muscleStyle("left-tricep")}/>
                            <ellipse cx="52" cy="116" rx="11" ry="22" style={strokeStyle("left-tricep")}/>
                        </g>
                        {/* RIGHT TRICEP */}
                        <g onClick={() => handleClick("right-tricep","Right Tricep")} onMouseEnter={() => setHovered("right-tricep")} onMouseLeave={() => setHovered("")}>
                            <ellipse cx="158" cy="116" rx="11" ry="22" style={muscleStyle("right-tricep")}/>
                            <ellipse cx="158" cy="116" rx="11" ry="22" style={strokeStyle("right-tricep")}/>
                        </g>
                        {/* LEFT GLUTE */}
                        <g onClick={() => handleClick("left-glute","Left Glute")} onMouseEnter={() => setHovered("left-glute")} onMouseLeave={() => setHovered("")}>
                            <path d="M68 190 Q87 185 103 190 L103 234 Q85 242 66 236Z" style={muscleStyle("left-glute")}/>
                            <path d="M68 190 Q87 185 103 190 L103 234 Q85 242 66 236Z" style={strokeStyle("left-glute")}/>
                        </g>
                        {/* RIGHT GLUTE */}
                        <g onClick={() => handleClick("right-glute","Right Glute")} onMouseEnter={() => setHovered("right-glute")} onMouseLeave={() => setHovered("")}>
                            <path d="M142 190 Q123 185 107 190 L107 234 Q125 242 144 236Z" style={muscleStyle("right-glute")}/>
                            <path d="M142 190 Q123 185 107 190 L107 234 Q125 242 144 236Z" style={strokeStyle("right-glute")}/>
                        </g>
                        {/* LEFT HAMSTRING */}
                        <g onClick={() => handleClick("left-hamstring","Left Hamstring")} onMouseEnter={() => setHovered("left-hamstring")} onMouseLeave={() => setHovered("")}>
                            <path d="M66 238 Q80 234 96 238 L98 300 Q82 307 64 302Z" style={muscleStyle("left-hamstring")}/>
                            <path d="M66 238 Q80 234 96 238 L98 300 Q82 307 64 302Z" style={strokeStyle("left-hamstring")}/>
                        </g>
                        {/* RIGHT HAMSTRING */}
                        <g onClick={() => handleClick("right-hamstring","Right Hamstring")} onMouseEnter={() => setHovered("right-hamstring")} onMouseLeave={() => setHovered("")}>
                            <path d="M144 238 Q130 234 114 238 L112 300 Q128 307 146 302Z" style={muscleStyle("right-hamstring")}/>
                            <path d="M144 238 Q130 234 114 238 L112 300 Q128 307 146 302Z" style={strokeStyle("right-hamstring")}/>
                        </g>
                        {/* LEFT CALF BACK */}
                        <g onClick={() => handleClick("left-calf-b","Left Calf")} onMouseEnter={() => setHovered("left-calf-b")} onMouseLeave={() => setHovered("")}>
                            <path d="M64 308 Q80 304 96 308 L94 390 Q80 397 62 393Z" style={muscleStyle("left-calf-b")}/>
                            <path d="M64 308 Q80 304 96 308 L94 390 Q80 397 62 393Z" style={strokeStyle("left-calf-b")}/>
                        </g>
                        {/* RIGHT CALF BACK */}
                        <g onClick={() => handleClick("right-calf-b","Right Calf")} onMouseEnter={() => setHovered("right-calf-b")} onMouseLeave={() => setHovered("")}>
                            <path d="M146 308 Q130 304 114 308 L116 390 Q130 397 148 393Z" style={muscleStyle("right-calf-b")}/>
                            <path d="M146 308 Q130 304 114 308 L116 390 Q130 397 148 393Z" style={strokeStyle("right-calf-b")}/>
                        </g>
                    </svg>
                )}
            </div>
        </div>
    );
}
