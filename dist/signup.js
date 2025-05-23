"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const prisma_1 = require("../dist/generated/prisma");
const utils_1 = require("./utils");
const prisma = new prisma_1.PrismaClient();
const handler = async (event) => {
    const body = JSON.parse(event.body || '{}');
    if (!body.email || !body.password) {
        return { statusCode: 400, body: 'Email and password required' };
    }
    try {
        const hashed = await (0, utils_1.hashPassword)(body.password);
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
    }
    catch (err) {
        console.error('Signup error:', err);
        if (err.code === 'P2002' &&
            err.meta?.target?.includes('email')) {
            return {
                statusCode: 409,
                body: 'Email already exists',
            };
        }
        return {
            statusCode: 500,
            body: 'Signup failed',
        };
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.handler = handler;
