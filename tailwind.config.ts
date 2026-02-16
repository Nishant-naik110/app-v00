import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        title: "2.5rem",
        header: "1.25rem",
        subHeader: "1rem",
        body: "0.875rem",
        subBody: "0.750rem",
        smallFont:"0.600rem",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bar-rise": {
          "0%": { transform: "scaleY(0.2)", opacity: "0.4" },
          "60%": { opacity: "0.9" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
        "bar-swipe": {
          "0%": { transform: "scaleX(0.2)", opacity: "0.4" },
          "60%": { opacity: "0.9" },
          "100%": { transform: "scaleX(1)", opacity: "1" },
        },
        "line-updown": {
          "0%, 100%": { 
            transform: "translateY(0) scaleY(1)",
            opacity: "0.6"
          },
          "12.5%": { 
            transform: "translateY(-3px) scaleY(1.01)",
            opacity: "0.75"
          },
          "25%": { 
            transform: "translateY(-6px) scaleY(1.03)",
            opacity: "0.85"
          },
          "37.5%": { 
            transform: "translateY(-8px) scaleY(1.04)",
            opacity: "0.95"
          },
          "50%": { 
            transform: "translateY(-10px) scaleY(1.05)",
            opacity: "1"
          },
          "62.5%": { 
            transform: "translateY(-8px) scaleY(1.04)",
            opacity: "0.95"
          },
          "75%": { 
            transform: "translateY(-6px) scaleY(1.03)",
            opacity: "0.85"
          },
          "87.5%": { 
            transform: "translateY(-3px) scaleY(1.01)",
            opacity: "0.75"
          },
        },
        "line-pulse": {
          "0%, 100%": { 
            strokeWidth: "3",
            filter: "opacity(1)"
          },
          "25%": { 
            strokeWidth: "3.5",
            filter: "opacity(0.9)"
          },
          "50%": { 
            strokeWidth: "4",
            filter: "opacity(0.8)"
          },
          "75%": { 
            strokeWidth: "3.5",
            filter: "opacity(0.9)"
          },
        },
        "line-glow": {
          "0%, 100%": { 
            filter: "drop-shadow(0 0 2px currentColor)",
            opacity: "0.7"
          },
          "50%": { 
            filter: "drop-shadow(0 0 6px currentColor)",
            opacity: "1"
          },
        },
        "line-wave": {
          "0%": { 
            d: "path('M 0,180 Q 150,160 300,90 T 600,60')"
          },
          "25%": { 
            d: "path('M 0,175 Q 150,155 300,85 T 600,55')"
          },
          "50%": { 
            d: "path('M 0,170 Q 150,150 300,80 T 600,50')"
          },
          "75%": { 
            d: "path('M 0,175 Q 150,155 300,85 T 600,55')"
          },
          "100%": { 
            d: "path('M 0,180 Q 150,160 300,90 T 600,60')"
          },
        },
        "progress-updown": {
          "0%, 100%": { 
            transform: "translateY(0)"
          },
          "50%": { 
            transform: "translateY(-4px)"
          },
        },
        "area-wave": {
          "0%, 100%": { 
            transform: "translateY(0)"
          },
          "50%": { 
            transform: "translateY(-8px)"
          },
        },
        "area-pulse": {
          "0%, 100%": { 
            opacity: "0.3",
            transform: "scaleY(1)"
          },
          "50%": { 
            opacity: "0.5",
            transform: "scaleY(1.05)"
          },
        },
        "point-float": {
          "0%, 100%": { 
            transform: "translateY(0) scale(1)",
            opacity: "0.7"
          },
          "50%": { 
            transform: "translateY(-4px) scale(1.1)",
            opacity: "1"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "scale-in": "scale-in 0.4s ease-out",
        "bar-rise": "bar-rise 1.2s ease-in-out infinite",
        "bar-swipe": "bar-swipe 1.2s ease-in-out infinite",
        "line-updown": "line-updown 2.5s ease-in-out infinite",
        "line-pulse": "line-pulse 2s ease-in-out infinite",
        "line-glow": "line-glow 2.5s ease-in-out infinite",
        "line-wave": "line-wave 3s ease-in-out infinite",
        "progress-updown": "progress-updown 2s ease-in-out infinite",
        "area-wave": "area-wave 3s ease-in-out infinite",
        "area-pulse": "area-pulse 2.5s ease-in-out infinite",
        "point-float": "point-float 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
  require("tailwindcss-animate"),
  function ({ addUtilities }: { addUtilities: any }) {
    addUtilities({
      ".no-scrollbar": {
        "-ms-overflow-style": "none", // IE & Edge
        "scrollbar-width": "none", // Firefox
      },
      ".no-scrollbar::-webkit-scrollbar": {
        display: "none", // Chrome, Safari
      },
    });
  },
],
};


export default config;
