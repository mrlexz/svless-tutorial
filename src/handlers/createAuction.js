import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';
import commonMiddleware from '../libs/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title, bidAmount } = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    highestBid: {
      amount: bidAmount,
    }
  };

  try {
    await dynamodb.put({
      TableName: "AuctionsTable",
      Item: auction,
    }).promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction);