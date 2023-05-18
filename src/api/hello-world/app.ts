import { APIGatewayProxyHandler } from 'aws-lambda';
import { lambdaHandler } from './src/handler';

export const handler: APIGatewayProxyHandler = lambdaHandler;
