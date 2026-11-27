import { Router, Request, Response } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';

const router = Router();

// Strictly anonymized read-only schedule for clients
router.get('/schedule/:shareToken', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { shareToken: String(req.params.shareToken) },
      select: { id: true, studioName: true },
    });

    if (!user) {
      res.status(404).json({ error: '档期链接不存在或已失效' });
      return;
    }

    const year = Number(req.query.year) || dayjs().year();
    const month = Number(req.query.month) || dayjs().month() + 1;
    const target = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const daysInMonth = target.daysInMonth();
    const startStr = target.format('YYYY-MM-DD');
    const endStr = target.endOf('month').format('YYYY-MM-DD');

    const [orders, blockedDates] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
          status: { not: 'CANCELLED' },
          OR: [
            { serviceDate: { gte: startStr, lte: endStr } },
            { serviceDate: { lte: endStr }, endDate: { gte: startStr } },
          ],
        },
        // Strictly select ONLY date fields — never select clientName, phone, location, or price
        select: {
          serviceDate: true,
          endDate: true,
        },
      }),
      prisma.blockedDate.findMany({
        where: {
          userId: user.id,
          date: { gte: startStr, lte: endStr },
        },
        select: { date: true },
      }),
    ]);

    const busySet = new Set<string>();
    for (const o of orders) {
      const start = dayjs(o.serviceDate);
      const end = o.endDate ? dayjs(o.endDate) : start;
      let cur = start;
      while (!cur.isAfter(end)) {
        busySet.add(cur.format('YYYY-MM-DD'));
        cur = cur.add(1, 'day');
      }
    }

    const blockedSet = new Set(blockedDates.map((b) => b.date));

    const days: Array<{ date: string; status: 'AVAILABLE' | 'BUSY' | 'BLOCKED' }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = target.date(d).format('YYYY-MM-DD');
      let status: 'AVAILABLE' | 'BUSY' | 'BLOCKED' = 'AVAILABLE';
      if (blockedSet.has(dateStr)) status = 'BLOCKED';
      else if (busySet.has(dateStr)) status = 'BUSY';
      days.push({ date: dateStr, status });
    }

    res.json({
      studioName: user.studioName,
      year,
      month,
      days,
    });
  } catch (err) {
    console.error('Public schedule error:', err);
    res.status(500).json({ error: '加载档期失败' });
  }
});

// Standard iCalendar (.ics) subscription feed for Apple Calendar
router.get('/calendar/:tokenWithExt', async (req: Request, res: Response) => {
  try {
    const shareToken = String(req.params.tokenWithExt).replace(/\.ics$/i, '');
    const user = await prisma.user.findUnique({
      where: { shareToken },
      select: { id: true, studioName: true },
    });

    if (!user) {
      res.status(404).send('Not Found');
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
      orderBy: { serviceDate: 'asc' },
    });

    const escapeIcs = (s: string) =>
      String(s || '')
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//QingJi//Schedule//CN',
      `X-WR-CALNAME:晴记 · ${escapeIcs(user.studioName)}`,
      'X-WR-TIMEZONE:Asia/Shanghai',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const o of orders) {
      const dtStart = `${o.serviceDate.replace(/-/g, '')}T${o.startTime.replace(':', '')}00`;
      const endDateStr = (o.endDate || o.serviceDate).replace(/-/g, '');
      const dtEnd = `${endDateStr}T${o.endTime.replace(':', '')}00`;
      const dtStamp = dayjs(o.updatedAt).format('YYYYMMDDTHHmmss') + 'Z';

      lines.push(
        'BEGIN:VEVENT',
        `UID:${o.id}@makeup-studio-h5`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART;TZID=Asia/Shanghai:${dtStart}`,
        `DTEND;TZID=Asia/Shanghai:${dtEnd}`,
        `SUMMARY:${escapeIcs(`${o.clientName} · ${o.serviceType}`)}`,
        `LOCATION:${escapeIcs(o.location || '待定地点')}`,
        `DESCRIPTION:${escapeIcs(`状态: ${o.status}\\n备注: ${o.notes || '无'}`)}`,
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="schedule.ics"');
    res.send(lines.join('\r\n'));
  } catch {
    res.status(500).send('Internal Server Error');
  }
});

export default router;
