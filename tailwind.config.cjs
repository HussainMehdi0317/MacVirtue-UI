module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["InterVariable", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
