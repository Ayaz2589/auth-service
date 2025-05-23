import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '../dist/generated/prisma';
import { AuthRequest } from '@/types';
import { comparePassword, generateToken } from '@/utils';

const prisma = new PrismaClient();

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}') as AuthRequest;

  if (!body.email || !body.password) {
    return { statusCode: 400, body: 'Email and password required' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return { statusCode: 401, body: 'Invalid credentials' };
    }

    const isValid = await comparePassword(body.password, user.password);
    if (!isValid) {
      return { statusCode: 401, body: 'Invalid credentials' };
    }

    const token = generateToken(user.id);
    return { statusCode: 200, body: JSON.stringify({ token }) };
  } catch (err: any) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      body: 'Login failed',
    };
  } finally {
    await prisma.$disconnect();
  }
};
