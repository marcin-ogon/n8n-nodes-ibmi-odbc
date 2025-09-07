// Credential type for IBM i ODBC connections
// Notes:
// - `icon` references a file path that must be valid from the built `dist`
//   layout. During development we keep the image in `src/nodes/IbmIOdbc` and
//   copy it to `dist/nodes/IbmIOdbc` as part of the build step so the runtime
//   credential icon resolves correctly when n8n loads the package.
import type { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class IbmiOdbc implements ICredentialType {
  name = 'ibmiOdbc';
  displayName = 'IBM i ODBC';
  // icon path should point to the node image after build (dist/credentials -> ../nodes/...)
  icon: Icon = 'file:../nodes/IbmIOdbc/ibmi-odbc-logo.png';
  documentationUrl = '';
  properties: INodeProperties[] = [
    {
      displayName: 'Host',
      name: 'host',
      type: 'string',
      default: '',
      required: true,
    },
    {
      displayName: 'User',
      name: 'user',
      type: 'string',
      default: '',
      required: true,
    },
    {
      displayName: 'Password',
      name: 'password',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
    },
    {
      displayName: 'Library List (DBQ)',
      name: 'dbq',
      type: 'string',
      default: '*USRLIBL',
      description: 'Comma separated list of libraries',
    },
    {
      displayName: 'Naming Mode',
      name: 'naming',
      type: 'options',
      options: [
        { name: 'System (*SYS)', value: '0' },
        { name: 'SQL (*SQL)', value: '1' },
      ],
      default: '1',
    },
  ];
}
