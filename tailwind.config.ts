import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        birthday: "0 26px 70px rgba(129, 93, 236, 0.28)",
        "birthday-button": "0 14px 28px rgba(105, 61, 218, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
