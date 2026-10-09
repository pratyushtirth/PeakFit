import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeakFit | AI Fitness Trainer",
  description: "AI-powered personalized workout planner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Material Symbols (icons used in UI) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700"
          rel="stylesheet"
        />

        {/* Inter font used by the Stitch design */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="bg-black text-slate-100 font-display antialiased">
        {children}
      </body>
    </html>
  );
}