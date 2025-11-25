import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/factories': path.resolve(__dirname, './src/factories'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/triggers': path.resolve(__dirname, './src/triggers'),
      '@/i18n': path.resolve(__dirname, './src/i18n'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/listeners': path.resolve(__dirname, './src/listeners'),
      '@/features': path.resolve(__dirname, './src/features'),
      // Link local State Manager SDK for hot reload during development
      // 'uneeq-state-manager': path.resolve(__dirname, '../../Uneeq/State Manager/State Manager - SDK/src'),
    },
    // Dedupe React to avoid duplicate instances when importing SDK
    dedupe: ['react', 'react-dom', 'zustand'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/src/tests/**',
        '**/*.d.ts',
        '**/src/types/**',
        '**/src/assets/**',
      ],
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      }
    }
  },
  optimizeDeps: {
    include: ['@testing-library/react', 'vitest']
  },
  server: {
    fs: {
      // Allow serving files from SDK directory
      allow: ['.', '../../Uneeq/State Manager/State Manager - SDK']
    }
  },
  json: {
    stringify: true
  }
});