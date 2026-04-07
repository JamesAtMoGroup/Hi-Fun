import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { logger } from '../utils/logger';

function formatUser(row: any) {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * POST /auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, displayName } = req.body;

  // Check if email already exists
  const existing = await db('users').where('email', email).first();
  if (existing) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Email already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = uuidv4();
  const now = new Date();

  await db('users').insert({
    id,
    email,
    password_hash: passwordHash,
    display_name: displayName,
    role: 'user',
    created_at: now,
    updated_at: now,
  });

  const user = await db('users').where('id', id).first();

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Store refresh token
  await db('refresh_tokens').insert({
    id: uuidv4(),
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_at: now,
  });

  res.status(201).json({
    success: true,
    data: {
      user: formatUser(user),
      accessToken,
      refreshToken,
    },
  });
}

/**
 * POST /auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await db('users').where('email', email).first();
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Store refresh token
  await db('refresh_tokens').insert({
    id: uuidv4(),
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
  });

  res.json({
    success: true,
    data: {
      user: formatUser(user),
      accessToken,
      refreshToken,
    },
  });
}

/**
 * POST /auth/refresh
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  // Verify JWT signature
  let payload: { id: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  // Check token exists in DB
  const storedToken = await db('refresh_tokens')
    .where('token', refreshToken)
    .where('user_id', payload.id)
    .first();

  if (!storedToken) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  // Invalidate old token
  await db('refresh_tokens').where('id', storedToken.id).delete();

  // Get user
  const user = await db('users').where('id', payload.id).first();
  if (!user) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'User not found');
  }

  // Generate new token pair
  const newAccessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await db('refresh_tokens').insert({
    id: uuidv4(),
    user_id: user.id,
    token: newRefreshToken,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
  });

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
}

/**
 * GET /auth/me
 */
export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const user = await db('users').where('id', userId).first();
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  res.json({
    success: true,
    data: formatUser(user),
  });
}
