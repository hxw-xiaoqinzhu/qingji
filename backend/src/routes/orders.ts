import { Router, Response } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatOrder(o: any) {
  return {
    ...o,
    referenceImages: (() => {
      try {
        return JSON.parse(o.referenceImages || '[]');
      } catch {
        return [];
      }
    })(),
    checklist: (() => {
      try {
        return JSON.parse(o.checklistJson || '[]');
      } catch {
        return [];
      }
    })(),
  };
}

async function checkScheduleConflict(
  userId: string,
  serviceDate: string,
  startTime: string,
  endTime: string,
  excludeOrderId?: string
) {
  const existingOrders = await prisma.order.findMany({
    where: {
      userId,
      serviceDate,
      deletedAt: null,
      status: { not: 'CANCELLED' },
      ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
    },
  });

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  const conflicts: Array<{ id: string; title: string; clientName: string; startTime: string; endTime: string; reason: string }> = [];

  for (const order of existingOrders) {
    const oStart = timeToMinutes(order.startTime);
    const oEnd = timeToMinutes(order.endTime);

    const overlaps = newStart < oEnd && newEnd > oStart;
    const gapBefore = newStart >= oEnd ? newStart - oEnd : Infinity;
    const gapAfter = oStart >= newEnd ? oStart - newEnd : Infinity;
    const minGap = Math.min(gapBefore, gapAfter);

    if (overlaps) {
      conflicts.push({
        id: order.id,
        title: order.title,
        clientName: order.clientName,
        startTime: order.startTime,
        endTime: order.endTime,
        reason: '时间段重叠',
      });
    } else if (minGap < 60) {
      conflicts.push({
        id: order.id,
        title: order.title,
        clientName: order.clientName,
        startTime: order.startTime,
        endTime: order.endTime,
        reason: `与已有行程间隔仅 ${minGap} 分钟（不足60分钟）`,
      });
    }
  }

  return conflicts;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, deleted, date } = req.query as Record<string, string>;
    const where: any = {
      userId: req.user!.userId,
      deletedAt: deleted === 'true' ? { not: null } : null,
    };

    if (date) {
      where.OR = [
        { serviceDate: date },
        { serviceDate: { lte: date }, endDate: { gte: date } },
      ];
    }

    if (status && status !== 'ALL') {
      if (status === 'PENDING_SERVICE') {
        where.status = { in: ['RESERVED', 'LOCKED'] };
      } else if (status === 'PENDING_BALANCE') {
        where.balanceDue = { gt: 0 };
        where.status = { not: 'CANCELLED' };
      } else if (status === 'COMPLETED') {
        where.status = { in: ['COMPLETED', 'SETTLED'] };
      } else {
        where.status = status;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { clientName: { contains: q } },
            { clientPhone: { contains: q } },
            { location: { contains: q } },
            { title: { contains: q } },
            { serviceType: { contains: q } },
            { notes: { contains: q } },
          ],
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        extraItems: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: [{ serviceDate: 'asc' }, { startTime: 'asc' }],
    });

    // Also compute pending balance count for tab badge
    const pendingBalanceCount = await prisma.order.count({
      where: {
        userId: req.user!.userId,
        deletedAt: null,
        status: { not: 'CANCELLED' },
        balanceDue: { gt: 0 },
      },
    });

    res.json({
      orders: orders.map(formatOrder),
      pendingBalanceCount,
    });
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ error: '获取订单列表失败' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
      include: {
        client: true,
        extraItems: true,
        payments: { orderBy: { paidAt: 'desc' } },
        expenses: { orderBy: { incurredAt: 'desc' } },
      },
    });

    if (!order) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }

    res.json({ order: formatOrder(order) });
  } catch {
    res.status(500).json({ error: '获取订单详情失败' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const {
      clientName,
      clientPhone,
      clientWechat,
      clientSource,
      title,
      serviceType = '新娘全天跟妆',
      serviceDate,
      endDate,
      startTime = '05:30',
      endTime = '13:30',
      commuteMinutes = 45,
      location = '',
      basePrice = 0,
      discount = 0,
      depositPaid = 0,
      paymentChannel = 'WECHAT',
      extraItems = [],
      assistantName = '',
      assistantFee = 0,
      assistantPaid = false,
      channelCommission = 0,
      notes = '',
      skinType = '',
      allergyNote = '',
      referenceImages = [],
      checklist,
      force = false,
    } = body;

    if (!clientName || !serviceDate) {
      res.status(400).json({ error: '请填写客户姓名和服务日期' });
      return;
    }

    if (!force) {
      const conflicts = await checkScheduleConflict(req.user!.userId, serviceDate, startTime, endTime);
      if (conflicts.length > 0) {
        res.status(409).json({
          code: 'SCHEDULE_CONFLICT',
          error: '检测到档期时间冲突或间隔不足 60 分钟',
          conflicts,
        });
        return;
      }
    }

    // Auto-find or create client
    let client = await prisma.client.findFirst({
      where: {
        userId: req.user!.userId,
        ...(clientPhone ? { OR: [{ phone: clientPhone }, { name: clientName }] } : { name: clientName }),
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: req.user!.userId,
          name: clientName,
          phone: clientPhone || null,
          wechat: clientWechat || null,
          source: clientSource || null,
          skinType: skinType || null,
          allergyNote: allergyNote || null,
        },
      });
    } else if (skinType || allergyNote || clientPhone) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          phone: clientPhone || client.phone,
          skinType: skinType || client.skinType,
          allergyNote: allergyNote || client.allergyNote,
        },
      });
    }

    const parsedExtras = Array.isArray(extraItems)
      ? extraItems
          .filter((item: any) => item.name)
          .map((item: any) => {
            const unitPrice = Number(item.unitPrice) || 0;
            const quantity = Number(item.quantity) || 1;
            return {
              name: String(item.name),
              unitPrice,
              quantity,
              subtotal: unitPrice * quantity,
            };
          })
      : [];

    const extraTotal = parsedExtras.reduce((sum: number, i: any) => sum + i.subtotal, 0);
    const totalAmount = Math.max(0, Number(basePrice) + extraTotal - Number(discount));
    const depositNum = Math.max(0, Number(depositPaid) || 0);
    const balanceDue = Math.max(0, totalAmount - depositNum);

    let status = body.status;
    if (!status) {
      if (totalAmount > 0 && balanceDue === 0) status = 'SETTLED';
      else if (depositNum > 0) status = 'LOCKED';
      else status = 'RESERVED';
    }

    // Default checklist from user template
    let finalChecklist = checklist;
    if (!Array.isArray(finalChecklist)) {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      let labels: string[] = [];
      try {
        labels = JSON.parse(user?.checklistTemplate || '[]');
      } catch {
        labels = [];
      }
      finalChecklist = labels.map((label, idx) => ({
        id: `chk-${idx + 1}`,
        label,
        checked: false,
      }));
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user!.userId,
        clientId: client.id,
        clientName,
        clientPhone: clientPhone || null,
        title: title || `${clientName} · ${serviceType}`,
        serviceType,
        serviceDate,
        endDate: endDate || null,
        startTime,
        endTime,
        commuteMinutes: Number(commuteMinutes) || 45,
        location,
        status,
        basePrice: Number(basePrice) || 0,
        extraTotal,
        discount: Number(discount) || 0,
        totalAmount,
        depositPaid: depositNum,
        balanceDue,
        assistantName: assistantName || null,
        assistantFee: Number(assistantFee) || 0,
        assistantPaid: Boolean(assistantPaid),
        channelCommission: Number(channelCommission) || 0,
        notes,
        skinType: skinType || null,
        allergyNote: allergyNote || null,
        referenceImages: JSON.stringify(Array.isArray(referenceImages) ? referenceImages : []),
        checklistJson: JSON.stringify(finalChecklist),
        extraItems: {
          create: parsedExtras,
        },
        ...(depositNum > 0
          ? {
              payments: {
                create: {
                  userId: req.user!.userId,
                  type: balanceDue === 0 ? 'BALANCE' : 'DEPOSIT',
                  amount: depositNum,
                  channel: paymentChannel,
                  note: balanceDue === 0 ? '全款收讫' : '锁档定金',
                },
              },
            }
          : {}),
      },
      include: {
        extraItems: true,
        payments: true,
      },
    });

    res.status(201).json({ order: formatOrder(order) });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: '创建订单失败' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.order.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
      include: { extraItems: true },
    });
    if (!existing) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }

    const body = req.body;
    const serviceDate = body.serviceDate ?? existing.serviceDate;
    const startTime = body.startTime ?? existing.startTime;
    const endTime = body.endTime ?? existing.endTime;

    if (
      !body.force &&
      (body.serviceDate !== undefined || body.startTime !== undefined || body.endTime !== undefined)
    ) {
      const conflicts = await checkScheduleConflict(
        req.user!.userId,
        serviceDate,
        startTime,
        endTime,
        existing.id
      );
      if (conflicts.length > 0) {
        res.status(409).json({
          code: 'SCHEDULE_CONFLICT',
          error: '检测到档期时间冲突或间隔不足 60 分钟',
          conflicts,
        });
        return;
      }
    }

    const updateData: any = {};
    const fields = [
      'clientName',
      'clientPhone',
      'title',
      'serviceType',
      'serviceDate',
      'endDate',
      'startTime',
      'endTime',
      'location',
      'status',
      'assistantName',
      'assistantPaid',
      'notes',
      'skinType',
      'allergyNote',
    ];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }

    if (body.commuteMinutes !== undefined) updateData.commuteMinutes = Number(body.commuteMinutes) || 0;
    if (body.assistantFee !== undefined) updateData.assistantFee = Number(body.assistantFee) || 0;
    if (body.channelCommission !== undefined) updateData.channelCommission = Number(body.channelCommission) || 0;
    if (body.referenceImages !== undefined) updateData.referenceImages = JSON.stringify(body.referenceImages);
    if (body.checklist !== undefined) updateData.checklistJson = JSON.stringify(body.checklist);

    // Recalculate financials if pricing changed
    const hasPricingChange =
      body.basePrice !== undefined ||
      body.discount !== undefined ||
      body.depositPaid !== undefined ||
      Array.isArray(body.extraItems);

    if (hasPricingChange) {
      let extraTotal = existing.extraTotal;
      if (Array.isArray(body.extraItems)) {
        await prisma.orderExtraItem.deleteMany({ where: { orderId: existing.id } });
        const parsedExtras = body.extraItems
          .filter((i: any) => i.name)
          .map((i: any) => {
            const unitPrice = Number(i.unitPrice) || 0;
            const quantity = Number(i.quantity) || 1;
            return {
              orderId: existing.id,
              name: String(i.name),
              unitPrice,
              quantity,
              subtotal: unitPrice * quantity,
            };
          });
        if (parsedExtras.length > 0) {
          await prisma.orderExtraItem.createMany({ data: parsedExtras });
        }
        extraTotal = parsedExtras.reduce((sum: number, i: any) => sum + i.subtotal, 0);
      }

      const basePrice = body.basePrice !== undefined ? Number(body.basePrice) : existing.basePrice;
      const discount = body.discount !== undefined ? Number(body.discount) : existing.discount;
      const depositPaid = body.depositPaid !== undefined ? Number(body.depositPaid) : existing.depositPaid;
      const totalAmount = Math.max(0, basePrice + extraTotal - discount);
      const balanceDue = Math.max(0, totalAmount - depositPaid);

      updateData.basePrice = basePrice;
      updateData.extraTotal = extraTotal;
      updateData.discount = discount;
      updateData.totalAmount = totalAmount;
      updateData.depositPaid = depositPaid;
      updateData.balanceDue = balanceDue;

      if (!body.status) {
        if (totalAmount > 0 && balanceDue === 0) updateData.status = 'SETTLED';
        else if (depositPaid > 0 && existing.status === 'RESERVED') updateData.status = 'LOCKED';
      }

      // Keep PaymentRecord strictly in sync when depositPaid is modified via order edit
      if (body.depositPaid !== undefined) {
        const existingPayments = await prisma.paymentRecord.findMany({
          where: { orderId: existing.id },
          orderBy: { paidAt: 'asc' },
        });
        const currentPaidSum = existingPayments.reduce((s, p) => s + p.amount, 0);
        const diff = depositPaid - currentPaidSum;

        if (depositPaid <= 0 && existingPayments.length > 0) {
          await prisma.paymentRecord.deleteMany({ where: { orderId: existing.id } });
        } else if (diff > 0.009) {
          await prisma.paymentRecord.create({
            data: {
              userId: req.user!.userId,
              orderId: existing.id,
              type: balanceDue === 0 ? 'BALANCE' : 'DEPOSIT',
              amount: Number(diff.toFixed(2)),
              channel: body.paymentChannel || 'WECHAT',
              note: currentPaidSum === 0 ? '锁档定金' : '编辑补充收款',
            },
          });
        } else if (diff < -0.009) {
          await prisma.paymentRecord.deleteMany({ where: { orderId: existing.id } });
          if (depositPaid > 0) {
            await prisma.paymentRecord.create({
              data: {
                userId: req.user!.userId,
                orderId: existing.id,
                type: balanceDue === 0 ? 'BALANCE' : 'DEPOSIT',
                amount: Number(depositPaid.toFixed(2)),
                channel: body.paymentChannel || 'WECHAT',
                note: '编辑调整已收款',
              },
            });
          }
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        extraItems: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    res.json({ order: formatOrder(updated) });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: '更新订单失败' });
  }
});

router.delete('/trash/empty', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const trashed = await prisma.order.findMany({
      where: { userId, deletedAt: { not: null } },
      select: { id: true, clientId: true },
    });
    const clientIds = [...new Set(trashed.map((o) => o.clientId).filter(Boolean))] as string[];

    await prisma.order.deleteMany({
      where: { userId, deletedAt: { not: null } },
    });

    // Cascade-clean orphaned clients that have 0 remaining orders
    if (clientIds.length > 0) {
      await prisma.client.deleteMany({
        where: {
          userId,
          id: { in: clientIds },
          orders: { none: {} },
        },
      });
    }

    res.json({ success: true, deletedCount: trashed.length });
  } catch (err) {
    console.error('Empty trash error:', err);
    res.status(500).json({ error: '清空回收站失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const permanent = req.query.permanent === 'true';
    const existing = await prisma.order.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }

    if (permanent) {
      await prisma.order.delete({ where: { id: existing.id } });
      // If client has no remaining orders (active or trashed), remove orphaned client archive
      if (existing.clientId) {
        const remaining = await prisma.order.count({
          where: { clientId: existing.clientId },
        });
        if (remaining === 0) {
          await prisma.client.deleteMany({
            where: { id: existing.clientId, userId: req.user!.userId },
          });
        }
      }
    } else {
      await prisma.order.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: '删除订单失败' });
  }
});

router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.order.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }

    const restored = await prisma.order.update({
      where: { id: existing.id },
      data: { deletedAt: null },
    });
    res.json({ order: formatOrder(restored) });
  } catch {
    res.status(500).json({ error: '恢复订单失败' });
  }
});

router.post('/:id/payments', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.order.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }

    const amount = Number(req.body.amount ?? existing.balanceDue);
    if (!amount || amount <= 0) {
      res.status(400).json({ error: '收款金额必须大于 0' });
      return;
    }

    const type = req.body.type || (amount >= existing.balanceDue ? 'BALANCE' : 'DEPOSIT');
    const channel = req.body.channel || 'WECHAT';
    const note = req.body.note || (type === 'BALANCE' ? '结清尾款' : '收款入账');
    const paidAt = req.body.paidAt ? dayjs(req.body.paidAt).toDate() : new Date();

    await prisma.paymentRecord.create({
      data: {
        userId: req.user!.userId,
        orderId: existing.id,
        type,
        amount,
        channel,
        paidAt,
        note,
      },
    });

    const newPaid = existing.depositPaid + amount;
    const newBalance = Math.max(0, existing.totalAmount - newPaid);
    const newStatus = newBalance === 0 ? 'SETTLED' : existing.status === 'RESERVED' ? 'LOCKED' : existing.status;

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        depositPaid: newPaid,
        balanceDue: newBalance,
        status: newStatus,
      },
      include: {
        extraItems: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    res.json({ order: formatOrder(updated) });
  } catch (err) {
    console.error('Add payment error:', err);
    res.status(500).json({ error: '登记收款失败' });
  }
});

export default router;
