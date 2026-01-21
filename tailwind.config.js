// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        primary: "Montreal",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("@tailwindcss/typography")],
};
