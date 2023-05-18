// import { captureAWSv3Client } from 'aws-xray-sdk-core';
// import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

export enum Metrics {
  DynamoDBError = 'DynamoDBError',
}

// // AWS setup
// const AWS_REGION = process.env.AWS_REGION ?? '';
// const TABLE_NAME = process.env.TABLE_NAME ?? '';
// let dynamoDBClient: DynamoDBClient;
// if (process.env.AWS_SAM_LOCAL) {
//   dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });
// } else {
//   dynamoDBClient = captureAWSv3Client(
//     new DynamoDBClient({ region: AWS_REGION }),
//   );
// }

// Mock external call to db
async function getDbItem(id: string) {
  return new Promise((r) => r(`hello world ${id}`));
}

export const aws = {
  getDbItem,
};
