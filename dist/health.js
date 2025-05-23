"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const prisma_1 = require("../dist/generated/prisma");
const prisma = new prisma_1.PrismaClient();
const handler = async (_event) => {
    try {
        console.log('Running health check...');
        await prisma.$queryRaw `SELECT 1`;
        return { statusCode: 200, body: 'OK' };
    }
    catch (err) {
        console.error('Health check failed:', err.message || err);
        return { statusCode: 500, body: 'Database connection failed' };
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.handler = handler;
