# n8n-nodes-ibmi-odbc

Community node for [n8n](https://n8n.io) to run SQL and CL commands on IBM i (AS/400) via ODBC.

## Features

- Execute arbitrary SQL
- Call stored procedures
- Run CL commands via QSYS2.QCMDEXC
- Connection pooling for performance

## Credentials

Provide Host, User, Password, optional Library List (DBQ) and Naming mode.

## Development

Install dependencies and run tests:

```bash
npm ci
npm test
```

Build:

```bash
npm run build
```

## Releasing

Commits follow Conventional Commits. Merging to `main` triggers semantic-release which publishes to npm (needs `NPM_TOKEN`).

## License

MIT
