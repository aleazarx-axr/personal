/** @type {import('tailwindcss').Config} */
export default {
  // THIS LINE is critical. It tells Tailwind to look at all your React files.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}