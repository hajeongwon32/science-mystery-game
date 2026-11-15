import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Normal deployment keeps large artwork as cacheable files. The separate
    // standalone packager embeds it only in the downloadable review copy.
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
