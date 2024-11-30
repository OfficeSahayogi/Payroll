/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Ensure Tailwind scans all JS and JSX files in the src folder
  ],
  theme: {
    extend: {
      fontFamily: {
        // You can define custom fonts here if needed
      },
      colors: {
        background: "var(--background)", // Custom colors from CSS variables
        boxes: "var(--boxes)",
        "bright-blue": "var(--bright-blue)",
        dark: "var(--dark)",
        "variable-collection-grey": "var(--variable-collection-grey)",
        "variable-collection-white": "var(--variable-collection-white)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar": {
          /* Hide scrollbar for all browsers */
          "-ms-overflow-style": "none", /* IE and Edge */
          "scrollbar-width": "none", /* Firefox */
          "&::-webkit-scrollbar": {
            display: "none", /* Chrome, Safari */
          },
        },
      });
    },
  ],
};
