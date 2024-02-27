import { defineConfig } from 'vite';
import pulse from './plugin';

export default defineConfig({
  plugins: [pulse()],
  build: {
    // minify: false
  }
});
