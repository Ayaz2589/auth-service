"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const prisma_1 = require("../dist/generated/prisma");
const utils_1 = require("@/utils");
const prisma = new prisma_1.PrismaClient();
const handler = async (event) => {
    const body = JSON.parse(event.body || '{}');
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
        const isValid = await (0, utils_1.comparePassword)(body.password, user.password);
        if (!isValid) {
            return { statusCode: 401, body: 'Invalid credentials' };
        }
        const token = (0, utils_1.generateToken)(user.id);
        return { statusCode: 200, body: JSON.stringify({ token }) };
    }
    catch (err) {
        console.error('Login error:', err);
        return {
            statusCode: 500,
            body: 'Login failed',
        };
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.handler = handler;
