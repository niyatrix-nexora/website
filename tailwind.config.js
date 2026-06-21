module.exports = {
  content: [
    "./website/templates/**/*.html",
    "./website/static/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#03050c",
        surface: "#080a14",
        accent: "#5b6ef5",
        accent2: "#9b87f5",
        accent3: "#c084fc",
        muted: "#d1d1d6",
        muted2: "#9ca3af",
        "lyzr-teal": "#00d4c8",
      },
      fontFamily: {
        hero: ["Clash Display", "Space Grotesk", "sans-serif"],
        body: ["Satoshi", "Inter", "sans-serif"],
        logo: ["Space Grotesk", "sans-serif"],
        navbar: ["Satoshi", "Inter", "sans-serif"],
        button: ["Satoshi", "Inter", "sans-serif"],
        ui: ["Satoshi", "Inter", "sans-serif"],
      },
    },
  },
};
