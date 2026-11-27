import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'makeup-studio-access-secret-2026-dev';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'makeup-studio-refresh-secret-2026-dev';

export interface AuthPayload {
  userId: string;
  sessionId: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '2h' });
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, ACCESS_SECRET) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, REFRESH_SECRET) as AuthPayload;
}

export function parseDeviceInfo(userAgent?: string): string {
  if (!userAgent) return '未知设备';
  const ua = userAgent.toLowerCase();
  let os = '未知系统';
  if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('windows')) os = 'Windows';

  let browser = '浏览器';
  if (ua.includes('micromessenger')) browser = '微信内置浏览器';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';

  return `${os} · ${browser}`;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: '未登录或登录已过期' });
      return;
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    // Ensure session still exists (supports kicking out other devices)
    const session = await prisma.userSession.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.userId !== payload.userId || session.expiresAt < new Date()) {
      res.status(401).json({ error: '当前设备登录已失效，请重新登录' });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: '登录凭证无效或已过期' });
  }
}
