/**
 * Tailwind CSS configuration for ShawedGym.
 *
 * The `content` array tells Tailwind where to look for class names.
 * This project scans all HTML and JSX/TSX files within the src folder
 * as well as the root `index.html` to generate the appropriate utility
 * classes.  Feel free to extend the theme or add plugins here.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Extend the default colour palette or spacing scale here if you
      // require custom design tokens.  See the Tailwind docs for more
      // information.
    },
  },
  plugins: [],
};