import { EventEmitter } from 'events';
import { Router, Request, Response } from 'express';
import dayjs from 'dayjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  AuthRequest,
  comparePassword,
  hashPassword,
  hashToken,
  parseDeviceInfo,
  requireAuth,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../lib/auth';

const router = Router();
const sessionBus = new EventEmitter();
sessionBus.setMaxListeners(200);

const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2位').max(32),
  password: z.string().min(6, '密码至少6位').max(64),
  studioName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional().nullable(),
});

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名或手机号'),
  password: z.string().min(1, '请输入密码'),
});

function sanitizeUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    phone: user.phone,
    studioName: user.studioName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    monthlyTarget: user.monthlyTarget,
    noticeTemplate: user.noticeTemplate,
    checklistTemplate: (() => {
      try {
        return JSON.parse(user.checklistTemplate || '[]');
      } catch {
        return [];
      }
    })(),
    shareToken: user.shareToken,
    createdAt: user.createdAt,
  };
}

async function createSessionTokens(userId: string, req: Request) {
  const expiresAt = dayjs().add(30, 'day').toDate();
  const deviceInfo = (req.headers['x-device-name'] as string) || parseDeviceInfo(req.headers['user-agent']);
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  const session = await prisma.userSession.create({
    data: {
      userId,
      refreshTokenHash: 'pending',
      deviceInfo,
      ip,
      expiresAt,
    },
  });

  const payload = { userId, sessionId: session.id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.userSession.update({
    where: { id: session.id },
    data: { refreshTokenHash: hashToken(refreshToken) },
  });

  return { accessToken, refreshToken, sessionId: session.id };
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || '参数错误' });
      return;
    }

    const { username, password, studioName, phone } = parsed.data;
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, ...(phone ? [{ phone }] : [])],
      },
    });
    if (existing) {
      res.status(409).json({ error: '用户名或手机号已被注册' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        phone: phone || null,
        passwordHash,
        studioName: studioName || '晴记工作室',
      },
    });

    // Seed default packages for new user
    await prisma.packageTemplate.createMany({
      data: [
        { userId: user.id, name: '新娘全天跟妆', category: 'MAIN', price: 2880, defaultDurationMin: 600, description: '含早妆+仪式+敬酒共3套造型，免费试妆一次' },
        { userId: user.id, name: '新娘早妆（半天）', category: 'MAIN', price: 1580, defaultDurationMin: 240, description: '含晨袍+出门秀禾/主纱造型' },
        { userId: user.id, name: '妈妈妆 / 伴娘妆', category: 'EXTRA', price: 280, defaultDurationMin: 60, description: '精致清透妆面+简约盘发' },
        { userId: user.id, name: '早起费（6点前）', category: 'EXTRA', price: 200, defaultDurationMin: 0, description: '早上 6:00 每提前一小时加 100' },
      ],
    });

    const tokens = await createSessionTokens(user.id, req);
    res.status(201).json({
      user: sanitizeUser(user),
      ...tokens,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || '请输入账号密码' });
      return;
    }

    const { username, password } = parsed.data;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { phone: username }],
      },
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      res.status(401).json({ error: '账号或密码不正确' });
      return;
    }

    const tokens = await createSessionTokens(user.id, req);
    res.json({
      user: sanitizeUser(user),
      ...tokens,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: '缺少刷新凭证' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const session = await prisma.userSession.findUnique({
      where: { id: payload.sessionId },
    });

    if (
      !session ||
      session.userId !== payload.userId ||
      session.refreshTokenHash !== hashToken(refreshToken) ||
      session.expiresAt < new Date()
    ) {
      res.status(401).json({ error: '登录已失效，请重新登录' });
      return;
    }

    const newAccessToken = signAccessToken({ userId: payload.userId, sessionId: session.id });
    const newRefreshToken = signRefreshToken({ userId: payload.userId, sessionId: session.id });

    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashToken(newRefreshToken),
        lastActiveAt: new Date(),
        expiresAt: dayjs().add(30, 'day').toDate(),
      },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId: session.id,
    });
  } catch {
    res.status(401).json({ error: '刷新凭证无效，请重新登录' });
  }
});

router.post('/logout', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.userSession.deleteMany({
      where: { id: req.user!.sessionId, userId: req.user!.userId },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: '退出登录失败' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  res.json({ user: sanitizeUser(user), currentSessionId: req.user!.sessionId });
});

router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { studioName, phone, monthlyTarget, noticeTemplate, checklistTemplate, avatarUrl, bio } = req.body;
    const data: any = {};
    if (typeof studioName === 'string' && studioName.trim()) data.studioName = studioName.trim();
    if (typeof phone === 'string' || phone === null) data.phone = phone || null;
    if (typeof monthlyTarget === 'number' && !Number.isNaN(monthlyTarget)) data.monthlyTarget = monthlyTarget;
    if (typeof noticeTemplate === 'string') data.noticeTemplate = noticeTemplate;
    if (Array.isArray(checklistTemplate)) data.checklistTemplate = JSON.stringify(checklistTemplate);
    if (typeof avatarUrl === 'string' || avatarUrl === null) data.avatarUrl = avatarUrl;
    if (typeof bio === 'string') data.bio = bio.trim().slice(0, 80);

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
    });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: '更新资料失败' });
  }
});

router.post('/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: '新密码至少 6 位' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user || !(await comparePassword(oldPassword, user.passwordHash))) {
      res.status(400).json({ error: '原密码不正确' });
      return;
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Revoke all other logged-in device sessions on password change
    const otherSessions = await prisma.userSession.findMany({
      where: { userId: user.id, id: { not: req.user!.sessionId } },
      select: { id: true },
    });
    if (otherSessions.length > 0) {
      await prisma.userSession.deleteMany({
        where: { userId: user.id, id: { not: req.user!.sessionId } },
      });
      for (const s of otherSessions) {
        sessionBus.emit(`revoke:${s.id}`);
      }
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: '修改密码失败' });
  }
});

// Lightweight session liveness check (used on visibilitychange / background pulse)
router.get('/ping', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ ok: true, sessionId: req.user!.sessionId });
});

// Real-time Server-Sent Events stream so kicked devices auto-logout instantaneously
router.get('/session-stream', async (req: Request, res: Response) => {
  const token = String(req.query.token || '');
  if (!token) {
    res.status(401).end();
    return;
  }

  let sessionId = '';
  let userId = '';
  try {
    const payload = verifyAccessToken(token);
    sessionId = payload.sessionId;
    userId = payload.userId;
  } catch {
    res.status(401).end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const existing = await prisma.userSession.findUnique({ where: { id: sessionId } });
  if (!existing || existing.userId !== userId || existing.expiresAt < new Date()) {
    res.write('event: revoked\ndata: {"reason":"kicked"}\n\n');
    res.end();
    return;
  }

  res.write('event: connected\ndata: {"ok":true}\n\n');

  const onRevoke = () => {
    res.write('event: revoked\ndata: {"reason":"kicked"}\n\n');
    res.end();
  };

  sessionBus.once(`revoke:${sessionId}`, onRevoke);
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sessionBus.off(`revoke:${sessionId}`, onRevoke);
  });
});

router.get('/sessions', requireAuth, async (req: AuthRequest, res: Response) => {
  const sessions = await prisma.userSession.findMany({
    where: {
      userId: req.user!.userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: 'desc' },
    select: {
      id: true,
      deviceInfo: true,
      ip: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });

  res.json({
    sessions: sessions.map((s) => ({
      ...s,
      isCurrent: s.id === req.user!.sessionId,
    })),
  });
});

router.delete('/sessions/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const targetId = String(req.params.id);
  const deleted = await prisma.userSession.deleteMany({
    where: {
      id: targetId,
      userId: req.user!.userId,
    },
  });
  if (deleted.count > 0) {
    sessionBus.emit(`revoke:${targetId}`);
  }
  res.json({ success: true });
});

export default router;
