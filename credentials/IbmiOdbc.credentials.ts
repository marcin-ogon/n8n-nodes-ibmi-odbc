import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class IbmiOdbc implements ICredentialType {
  name = 'ibmiOdbc';
  displayName = 'IBM i ODBC';
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
