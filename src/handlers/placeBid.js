import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../libs/commonMiddleware';
import { getAuctionById } from './getAuction';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {

  const { id } = event.pathParameters;
  const { amount } = event.body;

  if (!id) {
    throw new createError.BadRequest('Missing ID');
  }

  if (!amount) {
    throw new createError.BadRequest('Missing amount');
  }

  if (typeof amount !== 'number') {
    throw new createError.BadRequest('Amount must be a number');
  }

  const auction = await getAuctionById(id);

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
  }

  let result;

  try {
    const params = {
      TableName: "AuctionsTable",
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount',
      ExpressionAttributeValues: {
        ':amount': amount,
      },
      ReturnValues: 'ALL_NEW',
    };

    const data = await dynamodb.update(params).promise();

    result = data.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 202,
    body: JSON.stringify(result),
  };
}

export const handler = commonMiddleware(placeBid);