import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { metricScope, Unit } from 'aws-embedded-metrics';
import { aws } from './external';

function isDef<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null;
}

const response = (
  statusCode: number,
  body: object,
  additionalHeaders?: object,
) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    ...additionalHeaders,
  },
});

export const lambdaHandler = metricScope(
  (metrics) =>
    async (
      event: APIGatewayProxyEvent,
      context: Context,
    ): Promise<APIGatewayProxyResult> => {
      try {
        metrics.setNamespace(process.env.METRICS_NAMESPACE ?? 'Unknown');
        metrics.putDimensions({ Service: 'helloWorld' });
        metrics.setProperty('RequestId', context.awsRequestId);
        // Log event
        const logEvent = {
          // TBD
          resource: event.resource,
        };
        metrics.setProperty('Event', logEvent);
        const item = await aws.getDbItem();
        if (isDef(item)) console.log(item);
        metrics.putMetric('Success', 1, Unit.Count);
        return response(200, {
          status: 'OK',
          message: 'Hello World!',
        });
      } catch (err) {
        console.error(err);
        metrics.putMetric('UnknownError', 1, Unit.Count);
        return response(500, {
          status: 'ERROR',
          message: 'Server error!',
        });
      }
    },
);

export const handler: APIGatewayProxyHandler = lambdaHandler;
