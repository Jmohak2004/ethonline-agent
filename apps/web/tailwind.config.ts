import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#FAF8F4",
          100: "#F7F4EE", // primary background
          200: "#EFEBE1", // elevated beige
          300: "#E5DEC9", // warm tan
          400: "#D4C5A5",
        },
        beige: {
          50:  "#F6F3EB",
          100: "#ECE7DC",
          200: "#DFD8C7",
          300: "#CFC3AC",
        },
        brown: {
          50:  "#F7F4F1",
          100: "#EBE3DC",
          200: "#D6C4B4",
          300: "#B89D88",
          400: "#96755E",
          500: "#7A543A", // warm mocha / leather
          600: "#63412B", // rich cocoa
          700: "#4D311F", // dark espresso brown
          800: "#362114", // deep coffee
          900: "#22140C", // deep ink
        },
        ink: "#1E1611", // crisp dark espresso border & text
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "brutal-sm": "2px 2px 0px #1E1611",
        "brutal": "3px 3px 0px #1E1611",
        "brutal-md": "4px 4px 0px #1E1611",
        "brutal-lg": "6px 6px 0px #1E1611",
        "brutal-pressed": "1px 1px 0px #1E1611",
      },
    },
  },
  plugins: [],
};

export default config;
