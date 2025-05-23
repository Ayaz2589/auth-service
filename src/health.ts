import { PrismaClient } from '../dist/generated/prisma';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const prisma = new PrismaClient();

export const handler = async (
  _event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Running health check...');
    await prisma.$queryRaw`SELECT 1`;
    return { statusCode: 200, body: 'OK' };
  } catch (err: any) {
    console.error('Health check failed:', err.message || err);
    return { statusCode: 500, body: 'Database connection failed' };
  } finally {
    await prisma.$disconnect();
  }
};
