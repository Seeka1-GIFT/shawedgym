// PostCSS configuration.  It simply wires up Tailwind CSS and
// Autoprefixer.  When Vite processes your CSS files this configuration
// ensures that the Tailwind directives are expanded and vendor prefixes
// are added where necessary.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};