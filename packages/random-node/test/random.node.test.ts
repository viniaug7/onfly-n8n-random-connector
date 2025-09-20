import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { Random } from '../src/nodes/Random/Random.node';

type Parameters = Record<string, number | string>;

type MockedExecuteContext = Pick<
  IExecuteFunctions,
  'getInputData' | 'getNode' | 'getNodeParameter' | 'helpers'
>;

const baseItems: INodeExecutionData[] = [{ json: {} }];

const createContext = (
  params: Parameters,
  httpResponse: Promise<string> | string,
): MockedExecuteContext => {
  const helpers = {
    httpRequest: vi.fn().mockResolvedValue(httpResponse),
  };

  return {
    getInputData: () => baseItems,
    getNode: () => ({ name: 'Random' }),
    getNodeParameter: (name: string) => params[name],
    helpers,
  };
};

describe('Random node execute()', () => {
  it('returns a random integer when Random.org responds with a number', async () => {
    const context = createContext(
      {
        operation: 'generate',
        min: 1,
        max: 10,
      },
      Promise.resolve('7\n'),
    );

    const result = await Random.prototype.execute.call(context as unknown as IExecuteFunctions);

    expect(context.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://www.random.org/integers/',
      qs: {
        num: 1,
        min: 1,
        max: 10,
        col: 1,
        base: 10,
        format: 'plain',
        rnd: 'new',
      },
      json: false,
    });
    expect(result).toEqual([[{ json: { random: 7, min: 1, max: 10, provider: 'random.org' } }]]);
  });

  it('throws when min is greater than max', async () => {
    const context = createContext(
      {
        operation: 'generate',
        min: 10,
        max: 5,
      },
      Promise.resolve('7'),
    );

    await expect(
      Random.prototype.execute.call(context as unknown as IExecuteFunctions),
    ).rejects.toBeInstanceOf(NodeOperationError);
    expect(context.helpers.httpRequest).not.toHaveBeenCalled();
  });

  it('throws when Random.org response is not a number', async () => {
    const context = createContext(
      {
        operation: 'generate',
        min: 1,
        max: 10,
      },
      Promise.resolve('oops'),
    );

    await expect(
      Random.prototype.execute.call(context as unknown as IExecuteFunctions),
    ).rejects.toThrowError('Unexpected response from Random.org');
  });
});
