import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { metricScope, Unit } from 'aws-embedded-metrics';
import { response } from './utils';
import { Metrics as ExternalMetrics } from './external';
import { getHello } from './hello/getHello';

const METRICS_NAMESPACE = process.env.METRICS_NAMESPACE ?? 'Unknown';
const Service = 'RestApiName';

export const lambdaHandler = metricScope(
  (metrics) =>
    async (
      event: APIGatewayProxyEvent,
      context: Context,
    ): Promise<APIGatewayProxyResult> => {
      try {
        // Init metrics
        metrics.setNamespace(METRICS_NAMESPACE);
        metrics.putDimensions({ Service });
        metrics.setProperty('RequestId', context.awsRequestId);
        // Log event
        const logEvent = {
          extendedRequestId: event.requestContext.extendedRequestId,
          domainName: event.requestContext.domainName,
          path: event.path,
          resource: event.resource,
          httpMethod: event.httpMethod,
          requestTime: event.requestContext.requestTime,
          protocol: event.requestContext.protocol,
          userAgent: event.requestContext.identity.userAgent,
          sourceIp: event.requestContext.identity.sourceIp,
          pathParameters: event.pathParameters,
          queryStringParameters: event.queryStringParameters,
        };
        metrics.setProperty('Event', logEvent);
        switch (event.httpMethod) {
          case 'HEAD':
          case 'GET':
            switch (event.resource) {
              case '/hello':
              case '/hello/{helloId}':
                return await getHello(event, metrics);
              default:
                // Error because this shouldn't be in our template file
                metrics.putMetric('ResourceError', 1, Unit.Count);
                console.error('Server resource error!');
                return response(500, {
                  status: 'ERROR',
                  message: 'Server error!',
                });
            }
          default:
            // Error because this shouldn't be in our template file
            metrics.putMetric('ResourceError', 1, Unit.Count);
            console.error('Server resource error!');
            return response(500, {
              status: 'ERROR',
              message: 'Server error!',
            });
        }
      } catch (err) {
        if (
          err instanceof Error &&
          Object.values<string>(ExternalMetrics).includes(err.message)
        ) {
          metrics.putMetric(err.message, 1, Unit.Count);
        } else {
          console.error('Unknown error!', err);
          metrics.putMetric('UnknownError', 1, Unit.Count);
        }
        return response(500, {
          status: 'ERROR',
          message: 'Server error!',
        });
      }
    },
);
