"use client";

import { useState } from "react";

const exercises = [
    { name: "Bench Press", muscle: "Chest", equipment: "Barbell", difficulty: "Intermediate", icon: "fitness_center", sets: "4x8-10", tips: "Keep shoulder blades retracted, feet flat on floor." },
    { name: "Squat", muscle: "Legs", equipment: "Barbell", difficulty: "Intermediate", icon: "accessibility_new", sets: "4x6-8", tips: "Break parallel, keep chest up, brace your core." },
    { name: "Deadlift", muscle: "Back", equipment: "Barbell", difficulty: "Advanced", icon: "fitness_center", sets: "3x5", tips: "Neutral spine, bar close to body, drive through heels." },
    { name: "Pull-Up", muscle: "Back", equipment: "Bodyweight", difficulty: "Intermediate", icon: "sports_gymnastics", sets: "3x8-12", tips: "Full hang at bottom, chin over bar at top." },
    { name: "Overhead Press", muscle: "Shoulders", equipment: "Barbell", difficulty: "Intermediate", icon: "fitness_center", sets: "4x8", tips: "Lock out overhead, keep core braced." },
    { name: "Barbell Row", muscle: "Back", equipment: "Barbell", difficulty: "Intermediate", icon: "fitness_center", sets: "4x8-10", tips: "Hinge at hips, pull to lower chest." },
    { name: "Dumbbell Curl", muscle: "Arms", equipment: "Dumbbell", difficulty: "Beginner", icon: "sports_handball", sets: "3x12", tips: "Supinate wrist at top, control the negative." },
    { name: "Tricep Pushdown", muscle: "Arms", equipment: "Cable", difficulty: "Beginner", icon: "sports_handball", sets: "3x12-15", tips: "Lock elbows at sides, full extension at bottom." },
    { name: "Leg Press", muscle: "Legs", equipment: "Machine", difficulty: "Beginner", icon: "accessibility_new", sets: "4x10-12", tips: "Don't lock knees at top, feet shoulder-width apart." },
    { name: "Romanian Deadlift", muscle: "Hamstrings", equipment: "Barbell", difficulty: "Intermediate", icon: "fitness_center", sets: "3x10-12", tips: "Push hips back, slight knee bend, feel the stretch." },
    { name: "Plank", muscle: "Core", equipment: "Bodyweight", difficulty: "Beginner", icon: "sports_gymnastics", sets: "3x60s", tips: "Straight line from head to heels, breathe steadily." },
    { name: "Cable Fly", muscle: "Chest", equipment: "Cable", difficulty: "Beginner", icon: "fitness_center", sets: "3x12-15", tips: "Slight forward lean, meet hands at chest height." },
    { name: "Lateral Raise", muscle: "Shoulders", equipment: "Dumbbell", difficulty: "Beginner", icon: "sports_handball", sets: "3x15", tips: "Lead with elbows, stop at shoulder height." },
    { name: "Glute Bridge", muscle: "Glutes", equipment: "Bodyweight", difficulty: "Beginner", icon: "accessibility_new", sets: "3x15-20", tips: "Squeeze glutes at top, don't hyperextend lower back." },
    { name: "Face Pull", muscle: "Shoulders", equipment: "Cable", difficulty: "Beginner", icon: "sports_handball", sets: "3x15", tips: "Pull to forehead, elbows high, great for posture." },
    { name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbell", difficulty: "Intermediate", icon: "fitness_center", sets: "3x10-12", tips: "30-45° incline, retract shoulder blades throughout." },
];

const muscles = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Hamstrings", "Glutes"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const diffColor: Record<string, string> = { Beginner: "text-green-400", Intermediate: "text-yellow-400", Advanced: "text-red-400" };

export default function LibraryPage() {
    const [search, setSearch] = useState("");
    const [muscle, setMuscle] = useState("All");
    const [difficulty, setDifficulty] = useState("All");
    const [selected, setSelected] = useState<typeof exercises[0] | null>(null);

    const filtered = exercises.filter(e =>
        (muscle === "All" || e.muscle === muscle) &&
        (difficulty === "All" || e.difficulty === difficulty) &&
        (search === "" || e.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="w-full text-white">
            <header className="mb-8">
                <h1 className="text-4xl font-black">Exercise Library</h1>
                <p className="text-slate-400 mt-2">Browse {exercises.length} exercises with tips and recommended sets.</p>
            </header>

            {/* Search + Filters */}
            <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 mb-6 space-y-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-base">search</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600 text-sm" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {muscles.map(m => (
                        <button key={m} onClick={() => setMuscle(m)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${muscle === m ? "bg-primary text-white" : "bg-white/5 text-slate-400 hover:text-white"}`}>{m}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {difficulties.map(d => (
                        <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${difficulty === d ? "bg-primary text-white" : "bg-white/5 text-slate-400 hover:text-white"}`}>{d}</button>
                    ))}
                </div>
            </div>

            <p className="text-slate-500 text-sm mb-4">{filtered.length} exercises found</p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(ex => (
                    <div key={ex.name} onClick={() => setSelected(ex)} className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5 cursor-pointer hover:border-primary/40 transition-all group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">{ex.icon}</span>
                            </div>
                            <span className={`text-xs font-bold ${diffColor[ex.difficulty]}`}>{ex.difficulty}</span>
                        </div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{ex.name}</h3>
                        <div className="flex gap-3 mt-2 text-xs text-slate-400">
                            <span>{ex.muscle}</span>
                            <span>·</span>
                            <span>{ex.equipment}</span>
                            <span>·</span>
                            <span>{ex.sets}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black">{selected.name}</h2>
                                <p className={`text-sm font-bold mt-1 ${diffColor[selected.difficulty]}`}>{selected.difficulty}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[{ label: "Muscle Group", value: selected.muscle }, { label: "Equipment", value: selected.equipment }, { label: "Recommended", value: selected.sets }, { label: "Level", value: selected.difficulty }].map(d => (
                                <div key={d.label} className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400">{d.label}</p>
                                    <p className="font-bold text-sm mt-0.5">{d.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Form Tip</p>
                            <p className="text-sm text-slate-300">{selected.tips}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
