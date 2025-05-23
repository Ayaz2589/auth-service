import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
export const generateToken = (userId: number) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
