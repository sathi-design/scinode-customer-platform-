import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── SCINODE Design System — Figma-aligned tokens ──────────────────────

        // Primary
        primary: "#1F6F54",          // Figma: Primary
        "primary-bg": "#DFF3EE",     // Figma: Background 1

        // Role: CRO (Blue)
        cro: "#2F66D0",
        "cro-bg": "#EAF1FF",

        // Role: Manufacturing (Orange)
        manufacturing: "#F2552C",
        "manufacturing-bg": "#FFF1EC",

        // Role: Scientist (Purple)
        scientist: "#5B3BA8",
        "scientist-bg": "#F1EDFF",

        // Legacy aliases — keep so existing className refs still resolve
        "secondary-1": "#2F66D0",    // CRO
        "secondary-2": "#5B3BA8",    // Scientist
        "secondary-3": "#D95C7A",    // Pink (was #E36389)
        "secondary-4": "#F2552C",    // Manufacturing (was #FD4923)

        // Support / Accent Colors
        "accent-green": "#B7D77A",
        "accent-green-bg": "#EDF4E1",
        "accent-teal": "#1ABC9C",
        "accent-teal-bg": "#DCF0EC",
        "accent-pink": "#D95C7A",
        "accent-pink-bg": "#F3E6EA",

        // Neutrals (full Figma scale)
        "bg-page": "#F9FAFB",        // Card Background
        "bg-card": "#FFFFFF",
        "bg-subtle": "#E2E5E3",      // Stroke 1 / section surfaces (was #F3F4F6)
        "stroke-1": "#E2E5E3",       // Figma: Stroke 1
        "stroke-2": "#D2D2D5",       // Figma: Stroke 2

        // Semantic bg aliases (updated to Figma values)
        "bg-info": "#EAF1FF",        // CRO background
        "bg-success": "#DFF3EE",     // Primary background
        "bg-exclusive": "#F1EDFF",   // Scientist background
        "bg-blush": "#F3E6EA",       // accent-pink background
        "bg-peach": "#FFF1EC",       // Manufacturing background

        // Text scale
        "text-primary": "#171717",   // Figma: Primary Text (was #020202)
        "text-paragraph": "#5C5E5C", // Figma: Paragraph Text
        "text-body": "#4B5563",      // Figma: Not Started Text / body copy
        "text-muted": "#68747A",     // Figma: Disabled Text 1 (was #6B7280)
        "text-subtle": "#99A8AF",    // Figma: Disabled Text 2
        "text-disabled": "#CFD8DC",  // Figma: Disabled Text 3 (was #9CA3AF)

        // Border
        border: "#E2E5E3",           // Figma: Stroke 1 (was #B3B7BD)

        // Status
        "status-complete-bg": "#B2F3B7",
        "status-complete-text": "#0F7614",
        "status-pending-bg": "#FBF0C5",
        "status-pending-text": "#9C5022",
        "status-notstarted-bg": "#B3B7BD", // Figma: Not Started Background
        "status-notstarted-text": "#4B5563",
        "status-error-bg": "#FFEFEF",
        "status-error-text": "#C30E1A",

        nav: "#171717",              // Figma: Primary Text (was #020202)
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        none: "none",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
