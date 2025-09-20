import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Random implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Random',
    name: 'random',
    icon: 'file:random.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Generate true random numbers using Random.org',
    defaults: {
      name: 'Random',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'True Random Number Generator',
            value: 'generate',
            action: 'Generate a true random integer',
            description: 'Generate a true random number between Min and Max using Random.org',
          },
        ],
        default: 'generate',
      },
      {
        displayName: 'Min',
        name: 'min',
        type: 'number',
        typeOptions: {
          numberPrecision: 0,
        },
        default: 1,
        description: 'Lower bound (inclusive) for the random integer',
        displayOptions: {
          show: {
            operation: ['generate'],
          },
        },
      },
      {
        displayName: 'Max',
        name: 'max',
        type: 'number',
        typeOptions: {
          numberPrecision: 0,
        },
        default: 60,
        description: 'Upper bound (inclusive) for the random integer',
        displayOptions: {
          show: {
            operation: ['generate'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const operation = this.getNodeParameter('operation', itemIndex);

      if (operation !== 'generate') {
        throw new NodeOperationError(
          this.getNode(),
          `Unsupported operation: ${operation as string}`,
          {
            itemIndex,
          },
        );
      }

      const min = this.getNodeParameter('min', itemIndex) as number;
      const max = this.getNodeParameter('max', itemIndex) as number;

      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new NodeOperationError(this.getNode(), 'Both Min and Max must be integers', {
          itemIndex,
        });
      }

      if (min > max) {
        throw new NodeOperationError(this.getNode(), 'Min must be less than or equal to Max', {
          itemIndex,
        });
      }

      const response = (await this.helpers.httpRequest({
        method: 'GET',
        url: 'https://www.random.org/integers/',
        qs: {
          num: 1,
          min,
          max,
          col: 1,
          base: 10,
          format: 'plain',
          rnd: 'new',
        },
        json: false,
      })) as string;

      const parsed = Number.parseInt(response, 10);

      if (Number.isNaN(parsed)) {
        throw new NodeOperationError(this.getNode(), 'Unexpected response from Random.org', {
          itemIndex,
        });
      }

      returnData.push({
        json: {
          random: parsed,
          min,
          max,
          provider: 'random.org',
        },
      });
    }

    return [returnData];
  }
}
