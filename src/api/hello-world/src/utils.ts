export const response = (
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
