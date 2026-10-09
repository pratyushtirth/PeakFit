"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Settings {
    darkMode: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    workoutReminders: boolean;
    progressUpdates: boolean;
    twoFactorAuth: boolean;
    language: string;
    units: string;
}

const DEFAULTS: Settings = {
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    workoutReminders: true,
    progressUpdates: true,
    twoFactorAuth: false,
    language: "en",
    units: "metric",
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);

    // Load settings from backend on mount
    useEffect(() => {
        apiFetch("/api/settings")
            .then((data: Settings) => setSettings(data))
            .catch(() => {
                // If fails (first time user), keep defaults
                setSettings(DEFAULTS);
            })
            .finally(() => setLoading(false));
    }, []);

    const toggle = (key: keyof Settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const save = async () => {
        setSaving(true);
        setSaveError("");
        try {
            const updated = await apiFetch("/api/settings", {
                method: "PUT",
                body: JSON.stringify(settings),
            });
            setSettings(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e: any) {
            setSaveError("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteData = async () => {
        setDeleting(true);
        try {
            await apiFetch("/api/sessions/all", { method: "DELETE" });
            setDeleted(true);
            setShowDeleteConfirm(false);
            setTimeout(() => setDeleted(false), 3000);
        } catch (e: any) {
            alert("Failed to delete data. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[300px] text-white">
            <span className="text-slate-400">Loading settings...</span>
        </div>
    );

    return (
        <div className="w-full text-white max-w-2xl">
            <header className="mb-10">
                <h1 className="text-4xl font-black">Settings</h1>
                <p className="text-slate-400 mt-2">Customize your Peak Fit experience.</p>
            </header>

            {/* Success banner */}
            {saved && (
                <div className="mb-6 flex items-center gap-2 bg-green-900/30 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Settings saved successfully!
                </div>
            )}

            {/* Delete success banner */}
            {deleted && (
                <div className="mb-6 flex items-center gap-2 bg-green-900/30 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    All workout data deleted.
                </div>
            )}

            {/* Error banner */}
            {saveError && (
                <div className="mb-6 flex items-center gap-2 bg-rose-900/30 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm">
                    <span className="material-symbols-outlined text-base">error</span>
                    {saveError}
                </div>
            )}

            <div className="space-y-4">
                {/* Units */}
                <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                    <h2 className="font-bold mb-4">Units & Measurements</h2>
                    <div className="flex gap-3">
                        {[{ id: "metric", label: "Metric (kg, cm)" }, { id: "imperial", label: "Imperial (lb, in)" }].map(u => (
                            <button
                                key={u.id}
                                onClick={() => setSettings(prev => ({ ...prev, units: u.id }))}
                                className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${settings.units === u.id ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-slate-400"}`}
                            >
                                {u.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                    <h2 className="font-bold mb-4">Notifications</h2>
                    <div className="space-y-4">
                        {[
                            { key: "workoutReminders" as const, label: "Workout Reminders", desc: "Daily reminders to stay on schedule" },
                            { key: "progressUpdates" as const, label: "Weekly Progress Report", desc: "Summary of your week every Monday" },
                            { key: "emailNotifications" as const, label: "Achievement Alerts", desc: "Get notified when you hit milestones" },
                            { key: "pushNotifications" as const, label: "Sage Injury Warnings", desc: "AI alerts when overtraining risk is detected" },
                        ].map(n => (
                            <div key={n.key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">{n.label}</p>
                                    <p className="text-xs text-slate-500">{n.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggle(n.key)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings[n.key] ? "bg-primary" : "bg-white/10"}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[n.key] ? "translate-x-7" : "translate-x-1"}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5">
                    <h2 className="font-bold mb-4">Appearance</h2>
                    <div className="flex gap-3">
                        {[{ id: true, label: "Dark Mode" }, { id: false, label: "Light Mode" }].map(t => (
                            <button
                                key={String(t.id)}
                                onClick={() => setSettings(prev => ({ ...prev, darkMode: t.id }))}
                                className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${settings.darkMode === t.id ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-slate-400"}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-rose-900/10 p-6 rounded-xl border border-rose-500/20">
                    <h2 className="font-bold text-rose-400 mb-4">Danger Zone</h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium">Delete All Workout Data</p>
                            <p className="text-xs text-slate-500">Permanently removes all sessions and history</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 border border-rose-500/30 text-rose-400 rounded-lg text-sm hover:bg-rose-500/10 transition-colors"
                        >
                            Delete Data
                        </button>
                    </div>
                </div>

                <button
                    onClick={save}
                    disabled={saving}
                    className="w-full bg-primary hover:bg-red-800 font-bold py-4 rounded-xl transition-all disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-rose-400 text-3xl">warning</span>
                            <h3 className="text-xl font-black">Are you sure?</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            This will permanently delete all your workout sessions and exercise history. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteData}
                                disabled={deleting}
                                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete All"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
