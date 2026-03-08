import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1B1931',
        },
        secondary: '#44174E',
        tertiary: '#662249',
        accent: {
          red: '#A34054',
          orange: '#ED9E59',
          light: '#E9BCB9',
        },
      },
    },
  },
  plugins: [],
};
export default config;
