import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#9e0000",
                "background-dark": "#000000",
                "background-light": "#ffffff",
                "neutral-dark": "#0a0a0a",
                "border-dark": "#1a1a1a"
            },
            fontFamily: {
                display: ["Inter", "sans-serif"]
            },
            boxShadow: {
                primary: "0 0 30px rgba(158,0,0,0.35)"
            }
        }
    },
    plugins: []
};

export default config;