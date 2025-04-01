/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        0: "0px",
        1: "8px",
        2: "12px",
        3: "16px",
        4: "24px",
        5: "32px",
        6: "48px",
        7: "64px",
        8: "128px",
      },
      colors: {
        // In Tailwind 4.x, colors need to be defined as functions that return objects 
        // with shade variants or as direct color values
        primary: {
          DEFAULT: "#14213D",
        },
        secondary: {
          DEFAULT: "#FCA311"
        },
        background: "#E1E1E1",
      },
    },
  },
  plugins: [],
};
