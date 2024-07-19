/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js, ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        primary: "#23233C",
        secondary: "#EF863E"
      },
    },
  },
  plugins: [],
};
