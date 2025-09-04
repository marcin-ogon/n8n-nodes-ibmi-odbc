import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    coverage: { reporter: ['text', 'json', 'html'] },
    alias: {
      'n8n-workflow': path.resolve(__dirname, 'test/__mocks__/n8n-workflow.ts'),
    },
  },
});
