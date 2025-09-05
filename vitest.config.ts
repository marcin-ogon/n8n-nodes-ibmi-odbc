import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vitest config for unit tests
// - We alias `n8n-workflow` to a lightweight mock in `test/__mocks__` so the
//   tests run quickly without requiring a full n8n runtime.
// - Coverage reporters include text/json/html for CI friendliness.
export default defineConfig({
  test: {
    environment: 'node',
    coverage: { reporter: ['text', 'json', 'html'] },
    alias: {
      'n8n-workflow': path.resolve(__dirname, 'test/__mocks__/n8n-workflow.ts'),
    },
  },
});
