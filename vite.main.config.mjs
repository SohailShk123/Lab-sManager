import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // Agar pehle se kuch code tha to wo yahan rehne de sakte hain
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  build: {
    rollupOptions: {
      external: ['sqlite3'], // Ye line sabse important hai!
    },
  },
});