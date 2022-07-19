import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { aws } from '../external';

jest.mock('../external');
const mockedAws = jest.mocked(aws, true);

describe('hello world', function () {
  const ctx = { awsRequestId: 'abc' } as Context;

  it('does not throw an error', async () => {
    const { lambdaHandler } = await import('../app');
    const event = { resouce: '/hello' } as unknown as APIGatewayProxyEvent;
    mockedAws.getDbItem.mockResolvedValue('MOCK');
    return expect(async () => lambdaHandler(event, ctx)).not.toThrowError();
  });
});
