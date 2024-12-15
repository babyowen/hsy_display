import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'fade-in-out': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        'fade-in-out': 'fade-in-out 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
