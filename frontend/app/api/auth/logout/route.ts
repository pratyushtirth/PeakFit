import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8081";

export async function POST(req: NextRequest) {
    await fetch(`${BACKEND}/api/auth/logout`, { method: "POST" }).catch(() => {});
    const response = NextResponse.json({ message: "Logged out" }, { status: 200 });
    response.cookies.set("peakfit_token", "", { maxAge: 0, path: "/" });
    return response;
}
