import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '../dist/generated/prisma';
import { AuthRequest } from './types';
import { hashPassword } from './utils';

const prisma = new PrismaClient();

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}') as AuthRequest;

  if (!body.email || !body.password) {
    return { statusCode: 400, body: 'Email and password required' };
  }

  try {
    const hashed = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashed,
      },
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ userId: user.id }),
    };
  } catch (err: any) {
    console.error('Signup error:', err);

    if (
      err.code === 'P2002' &&
      err.meta?.target?.includes('email')
    ) {
      return {
        statusCode: 409,
        body: 'Email already exists',
      };
    }

    return {
      statusCode: 500,
      body: 'Signup failed',
    };
  } finally {
    await prisma.$disconnect();
  }
};
