/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        // sans: ["Oswald, ui-serif"],
      },

      backgroundColor: {
        fill: {
          primary: "hsl(var(--color-primary) / 1)",
          secondary: "hsl(var(--color-secondary) / 1)",
          bg: "hsl(var(--color-bg) / 1)",
        },
      },

      textColor: {
        txtcolor: {
          primary: "hsl(var(--text-pri) / 1)",
          secondary: "hsl(var(--text-secondary) / 1)",
          neutral: "hsl(var(--text-neutral) / 1)",
        },
        header: {
          primary: "hsl(var(--header-pri) / 1)",
        },
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/forms"), require("daisyui")],
};
