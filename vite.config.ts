import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // We use '.' instead of process.cwd() to avoid TypeScript errors regarding the Process type.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Prevent "process is not defined" error in browser
      // If API_KEY is undefined, default to an empty string so the code doesn't crash
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Polyfill process.env for safety if any other library tries to access it
      'process.env': {},
    },
    build: {
      // Ensure the output is compatible with standard deployments
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});