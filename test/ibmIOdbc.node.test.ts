import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IbmIOdbc } from '../nodes/IbmIOdbc/IbmIOdbc.node';

// Mock n8n workflow types minimal
class ExecuteFunctionsMock {
  private params: Record<string, any>[];
  private creds: any;
  constructor(params: Record<string, any>[], creds: any) {
    this.params = params;
    this.creds = creds;
  }
  getInputData() {
    return new Array(this.params.length).fill({ json: {} });
  }
  getNodeParameter(name: string, index: number) {
    return this.params[index][name];
  }
  async getCredentials() {
    return this.creds;
  }
  getNode() {
    return { name: 'test' } as any;
  }
  continueOnFail() {
    return false;
  }
}

// Mock odbc
const queryMock = vi.fn();
const connectMock = vi.fn(async () => ({ callProcedure: vi.fn(async () => ({ success: true })) }));
vi.mock('odbc', () => ({
  default: { pool: vi.fn(async () => ({ query: queryMock, connect: connectMock })) },
}));

describe('IbmIOdbc Node', () => {
  beforeEach(() => {
    queryMock.mockReset();
    connectMock.mockClear();
  });

  it('executes SQL', async () => {
    queryMock.mockResolvedValueOnce([{ A: 1 }]);
    const node = new IbmIOdbc();
    const exec = new (ExecuteFunctionsMock as any)(
      [{ resource: 'database', operation: 'executeSql', sql: 'SELECT 1 AS A' }],
      { host: 'host', user: 'u', password: 'p' },
    );
    const res = await node.execute.call(exec);
    expect(res[0][0].json.rows[0].A).toBe(1);
  });

  it('runs CL command', async () => {
    queryMock.mockResolvedValueOnce([]);
    const node = new IbmIOdbc();
    const exec = new (ExecuteFunctionsMock as any)(
      [{ resource: 'system', operationSystem: 'runCl', clCommand: 'DSPLIBL' }],
      { host: 'host', user: 'u', password: 'p' },
    );
    const res = await node.execute.call(exec);
    expect(res[0][0].json.ok).toBe(true);
  });
});
