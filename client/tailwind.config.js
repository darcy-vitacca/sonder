module.exports = {
  purge: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      body: ["IBM Plex Sans"],
    },
    extend: {
      colors: {
        blue: {
          100: "#d2d7db",
          200: "#a5afb8",
          300: "#798694",
          400: "#4c5e71",
          500: "#1f364d",
          600: "#192b3e",
          700: "#13202e",
          800: "#0c161f",
          900: "#060b0f",
        },
      },

      spacing: {
        70: "17.5rem",
        160: "40rem",
      },
      //this disables the default container so we can recreate it
      container: false,
    },
  },
  variants: {
    extend: {
      backgroundColor: ["disabled"],
      borderColor: ["disabled"],
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".container": {
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          "@screen sm": { maxWidth: "640px" },
          "@screen md": { maxWidth: "768px" },
          "@screen lg": { maxWidth: "975px" },
        },
      });
    },
  ],
};
