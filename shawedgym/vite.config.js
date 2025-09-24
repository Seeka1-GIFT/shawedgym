import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the ShawedGym project.  This config registers the
// React plugin so that JSX can be compiled correctly.  Additional
// configuration options can be added here if needed (e.g. proxy rules for
// API requests once a backend is introduced).
export default defineConfig({
  plugins: [react()],
});
