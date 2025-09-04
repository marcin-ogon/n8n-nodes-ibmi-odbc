export class NodeOperationError extends Error {
  constructor(
    public node: any,
    message: string,
  ) {
    super(message);
  }
}
export interface INodeExecutionData {
  json: any;
  pairedItem?: any;
}
export interface IExecuteFunctions {}
export interface INodeType {
  description: any;
  execute: (...args: any[]) => any;
}
export interface INodeTypeDescription {}
