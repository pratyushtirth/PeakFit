// This route is currently handled by /dashboard/workouts
// Redirect there to avoid confusion
import { redirect } from "next/navigation";
export default function TodayPage() {
    redirect("/dashboard/workouts");
}
