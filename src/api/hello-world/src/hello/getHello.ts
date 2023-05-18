import { APIGatewayProxyEvent } from 'aws-lambda';
import { Unit, MetricsLogger } from 'aws-embedded-metrics';
import { response } from '../utils';
import { aws } from '../external';
import { HelloPathParams } from './helloTypes';
import z from 'zod';

export async function getHello(
  event: APIGatewayProxyEvent,
  metrics: MetricsLogger,
) {
  try {
    // Determine get type
    let getType: 'getSingle' | 'getList';
    switch (event.resource) {
      case '/hello/{helloId}':
        getType = 'getSingle';
        break;
      case '/hello':
        getType = 'getList';
        break;
      default:
        // Bad path in API definition
        metrics.putMetric('ResourceError', 1, Unit.Count);
        console.error('Server resource error!');
        return response(500, {
          status: 'ERROR',
          message: 'Server error!',
        });
    }
    if (getType === 'getSingle') {
      // Parse input
      let helloId;
      try {
        const pathParams = HelloPathParams.parse(event.pathParameters);
        helloId = pathParams.helloId;
      } catch (err) {
        metrics.putMetric('InvalidRequest', 1, Unit.Count);
        let issues;
        if (err instanceof z.ZodError) {
          issues = err.issues;
        }
        console.error('Path validation issues', issues);
        return response(400, {
          status: 'ERROR',
          message: 'Invalid path parameter(s)',
          errors: issues ?? [
            {
              code: z.ZodIssueCode.custom,
              path: ['unknown'],
              message: 'Unknown validation issue',
            },
          ],
        });
      }
      const item = await aws.getDbItem(helloId);
      if (item) console.log(item);
      metrics.putMetric('Success', 1, Unit.Count);
      return response(200, {
        status: 'OK',
        hello: item,
      });
    }
    if (getType === 'getList') {
      // tbd
      metrics.putMetric('Success', 1, Unit.Count);
      return response(200, {
        status: 'OK',
        hellos: ['hello world', 'hola mundo', 'bonjour le monde'],
      });
    }
    throw Error('Unknown error');
  } catch (err) {
    console.error(err);
    metrics.putMetric('UnknownError', 1, Unit.Count);
    return response(500, {
      status: 'ERROR',
      message: 'Server error!',
    });
  }
}
