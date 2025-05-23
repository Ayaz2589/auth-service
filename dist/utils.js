"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const hashPassword = (password) => bcrypt_1.default.hash(password, 10);
exports.hashPassword = hashPassword;
const comparePassword = (plain, hash) => bcrypt_1.default.compare(plain, hash);
exports.comparePassword = comparePassword;
const generateToken = (userId) => jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
exports.generateToken = generateToken;
