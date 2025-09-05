# n8n-nodes-ibmi-odbc

Community node for [n8n](https://n8n.io) to run SQL and CL commands on IBM i (AS/400) via ODBC.

## Features

- Execute arbitrary SQL
- Call stored procedures
- Run CL commands via QSYS2.QCMDEXC
- Connection pooling for performance

## Credentials

Provide Host, User, Password, optional Library List (DBQ) and Naming mode.

# n8n-nodes-ibmi-odbc

IBM i (AS/400) node for n8n to run SQL and CL commands via ODBC.

This package provides a small, focused n8n community node to:

- Execute parameterized SQL queries against IBM i Db2
- Call stored procedures
- Run CL commands (via QSYS2.QCMDEXC)
- Reuse connections with a lightweight pool for bulk item performance

Why this project
-----------------
If you need to integrate n8n workflows with IBM i systems using an ODBC driver,
this node provides a straightforward, tested bridge with sensible defaults and
options for paging, terse output, and metadata control.

Quick start
-----------
1. Install dependencies and build:

```bash
npm install
npm run build
```

2. Run n8n with this node locally (fast path):

```bash
npm run dev:n8n
# or watch mode (rebuild on save then start n8n):
npm run dev:n8n:watch
```

If you prefer to point n8n directly at `dist/` manually:

```bash
N8N_CUSTOM_EXTENSIONS="$(pwd)/dist" npx n8n
```

Features & options
------------------
- Resource: Database or System
- Database operations:
	- Execute SQL (supports placeholders)
	- Call Procedure
- System operations:
	- Run CL command (executes using QSYS2.QCMDEXC)
- Options: reuse connection, include/exclude metadata, terse output, continueOnFail handling

Credentials
-----------
Credential fields (in the node UI):

- Host (system address)
- User
- Password
- Library List (DBQ) — default: `*USRLIBL`
- Naming mode — `*SQL` or `*SYS`

Implementation notes
--------------------
- The node uses the `odbc` package and a simple singleton pool to reuse
	connections within the node process.
- Credential icon files live under `src/nodes/<Node>/` and are copied to
	`dist/nodes/<Node>/` during the build so the `file:` paths resolve at runtime.

Using the node
--------------
- SQL: provide a query in the `SQL` field; enable `Use Parameters` to bind a
	JSON array or object.
	- Example parameter formats:
		- Array: `["ACME", 42]`
		- Object: `{ "CUST_ID": 42 }`
- CL: provide the CL command text (e.g., `DSPLIBL`) in the `CL Command` field.

Development & testing
---------------------
- Install deps and run unit tests:

```bash
npm ci
npm test
```

- Watch mode during development:

```bash
npm run dev      # tsc watch
npm run dev:n8n:watch
```

- Tests use `vitest` and an alias to `test/__mocks__/n8n-workflow.ts` so no
	live n8n runtime is required.

Code style
----------
- Prettier is used for formatting. Run:

```bash
npm run format
```

Releasing
---------
- Releases are handled with the `scripts/release.mjs` helper and a GitHub
	Actions workflow that publishes tags `vX.Y.Z` to npm (requires `NPM_TOKEN`).

Troubleshooting
---------------
- If the node does not appear in n8n:
	- Ensure `dist/` exists and was built
	- Verify `N8N_CUSTOM_EXTENSIONS` points to the absolute path of `dist/`
- TLS / driver issues: try `Ignore Unauthorized TLS` first; if it works, add a
	CA instead of ignoring.

License
-------
MIT
