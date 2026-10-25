import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite";
import "vitest/config"
import path from 'path';

// tsconfig.json 의 paths 와 같은 목록. tsconfig 가 테스트 파일을 빼고 있어서 tsconfig-paths 플러그인 대신 직접 둔다.
const alias = Object.fromEntries(
  ['routes', 'pages', 'components', 'constants', 'features', 'hooks', 'stores', 'games', 'records']
    .map((dir) => [`@${dir}`, path.resolve(__dirname, `./src/${dir}`)]),
);

// https://vitejs.dev/config/
export default defineConfig({
  base: '/acca-games/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { ...alias, '@layout': path.resolve(__dirname, './src/components/layout') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    maxWorkers: 4,
  },
})
