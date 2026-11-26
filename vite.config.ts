import { defineConfig, loadEnv } from 'vite';
import { rankingApi } from './server/rankings';

export default defineConfig(({ mode }) => ({
  plugins: [rankingApi(loadEnv(mode, process.cwd(), 'DB_'))],
  build: {
    // Normal deployment keeps large artwork as cacheable files. The separate
    // standalone packager embeds it only in the downloadable review copy.
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    modulePreload: false,
  },
}));
