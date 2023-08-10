import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import commonMiddleware from '../libs/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {

  let results;

  try {
    const data = await dynamodb.scan({
      TableName: "AuctionsTable",
    }).promise();
    results = data.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
}

export const handler = commonMiddleware(getAuctions);