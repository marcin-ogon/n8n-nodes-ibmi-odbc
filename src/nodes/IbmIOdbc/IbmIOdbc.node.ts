// copied from nodes with minimal path changes
/*
  IBM i ODBC Node for n8n

  Implementation notes:
  - This node uses the `odbc` package to create a pooled connection to an
  IBM i system. Connection string is built from credentials provided by the
  `IbmiOdbc` credential type.
  - For performance, a simple singleton pool (OdbcPool) is used. This is
  sufficient for the node's lifecycle in most n8n extension setups.
  - Errors are wrapped in `NodeOperationError` to provide consistent error
  messages to workflows that set `continueOnFail`.
*/
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import odbc from 'odbc';

interface IbmiCredentials {
  host: string;
  user: string;
  password: string;
  dbq?: string;
  naming?: string; // 0 or 1
}

class OdbcPool {
  private static pool: odbc.Pool | null = null;
  static async getPool(connectionString: string) {
    if (!this.pool) {
      this.pool = await odbc.pool(connectionString);
    }
    return this.pool;
  }
}

function buildConnectionString(creds: IbmiCredentials) {
  const parts = [
    'DRIVER=IBM i Access ODBC Driver',
    `SYSTEM=${creds.host}`,
    `UID=${creds.user}`,
    `Password=${creds.password}`,
    `Naming=${creds.naming || '1'}`,
    `DBQ=${creds.dbq ? creds.dbq : '*USRLIBL'}`,
  ];
  return parts.join(';');
}

export class IbmIOdbc implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'IBM i ODBC',
    name: 'ibmIOdbc',
  icon: 'file:ibmi-odbc-logo.png',
    group: ['transform'],
    version: 1,
    description: 'Run SQL and CL commands on IBM i via ODBC',
    defaults: {
      name: 'IBM i ODBC',
    },
  inputs: ['main'],
  outputs: ['main'],
    credentials: [
      {
        name: 'ibmiOdbc',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          { name: 'Database', value: 'database' },
          { name: 'System', value: 'system' },
        ],
        default: 'database',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['database'],
          },
        },
        options: [
          {
            name: 'Execute SQL',
            value: 'executeSql',
            description: 'Run an arbitrary SQL statement',
          },
          {
            name: 'Call Procedure',
            value: 'callProcedure',
            description: 'Call a stored procedure',
          },
        ],
        default: 'executeSql',
      },
      {
        displayName: 'Operation',
        name: 'operationSystem',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['system'],
          },
        },
        options: [{ name: 'Run CL Command', value: 'runCl' }],
        default: 'runCl',
      },
      // SQL inputs
      {
        displayName: 'SQL',
        name: 'sql',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['database'], operation: ['executeSql'] } },
      },
      {
        displayName: 'Procedure Catalog',
        name: 'procedureCatalog',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['database'], operation: ['callProcedure'] } },
        description: 'Catalog (can be blank)',
      },
      {
        displayName: 'Procedure Library',
        name: 'procedureLibrary',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['database'], operation: ['callProcedure'] } },
      },
      {
        displayName: 'Procedure Name',
        name: 'procedureName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['database'], operation: ['callProcedure'] } },
      },
      {
        displayName: 'CL Command',
        name: 'clCommand',
        type: 'string',
        typeOptions: { rows: 2 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['system'], operationSystem: ['runCl'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

  const creds = (await this.getCredentials('ibmiOdbc')) as unknown as IbmiCredentials;
    const connectionString = buildConnectionString(creds);
    const pool = await OdbcPool.getPool(connectionString);

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        if (resource === 'database') {
          const operation = this.getNodeParameter('operation', i) as string;
          if (operation === 'executeSql') {
            const sql = this.getNodeParameter('sql', i) as string;
            const result = await pool.query(sql);
            returnData.push({
              json: {
                rows: result,
                rowCount: Array.isArray(result) ? result.length : (result as unknown as { count?: number }).count,
              },
            });
          } else if (operation === 'callProcedure') {
            const catalog = (this.getNodeParameter('procedureCatalog', i) as string) || null;
            const library = this.getNodeParameter('procedureLibrary', i) as string;
            const procedure = this.getNodeParameter('procedureName', i) as string;
            const connection = await pool.connect();
            const result = await connection.callProcedure(catalog, library, procedure, []);
            returnData.push({ json: { result } });
          }
        } else if (resource === 'system') {
          const operation = this.getNodeParameter('operationSystem', i) as string;
          if (operation === 'runCl') {
            const clCommand = this.getNodeParameter('clCommand', i) as string;
            // Run CL via QSYS2.QCMDEXC procedure (wrap in CALL statement)
            const cmdEscaped = clCommand.replace(/'/g, "''");
            await pool.query(`CALL QSYS2.QCMDEXC('${cmdEscaped}')`);
            returnData.push({ json: { ok: true } });
          }
        }
      } catch (err) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (err as Error).message }, pairedItem: i });
          continue;
        }
        throw new NodeOperationError(this.getNode(), (err as Error).message);
      }
    }

    return [returnData];
  }
}
