import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../libs/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let result;
  try {
    const data = await dynamodb.get({
      TableName: "AuctionsTable",
      Key: { id },
    }).promise();

    result = data.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return result;
}

async function getAuction(event, context) {

  const { id } = event.pathParameters;

  if (!id) {
    throw new createError.BadRequest('Missing ID');
  }

  const result = await getAuctionById(id);

  if (!result) {
    throw new createError.NotFound(`Auction with ID "${id}" not found!`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}

export const handler = commonMiddleware(getAuction);