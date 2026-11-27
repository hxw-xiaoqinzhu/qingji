import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: 'luna' } });
  if (existing) {
    console.log('Seed user "luna" already exists, skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      username: 'luna',
      phone: '13800138000',
      passwordHash,
      studioName: '嘻嘻化妆室',
      monthlyTarget: 26000,
      shareToken: 'luna-studio-2026',
    },
  });

  // Packages
  await prisma.packageTemplate.createMany({
    data: [
      { userId: user.id, name: '新娘全天跟妆', category: 'MAIN', price: 3280, defaultDurationMin: 600, description: '含早妆+主仪式+敬酒共3套造型，含免费试妆与头饰借用' },
      { userId: user.id, name: '新娘精致早妆', category: 'MAIN', price: 1680, defaultDurationMin: 240, description: '含晨袍+出门秀禾/主纱1套完整造型' },
      { userId: user.id, name: '领证/轻婚纱跟妆', category: 'MAIN', price: 980, defaultDurationMin: 180, description: '清透伪素颜白开水妆面+韩系低盘发' },
      { userId: user.id, name: '商业广告/艺人妆造', category: 'MAIN', price: 2400, defaultDurationMin: 480, description: '棚拍/外景全天跟妆补妆' },
      { userId: user.id, name: '妈妈妆 / 伴娘妆', category: 'EXTRA', price: 280, defaultDurationMin: 60, description: '清透服帖底妆+气质盘发' },
      { userId: user.id, name: '早起费（6点前）', category: 'EXTRA', price: 200, defaultDurationMin: 0, description: '凌晨6:00前开妆交通补贴' },
      { userId: user.id, name: '外地出差补贴/天', category: 'EXTRA', price: 600, defaultDurationMin: 0, description: '跨城交通住宿外另计' },
    ],
  });

  // Clients
  const c1 = await prisma.client.create({
    data: { userId: user.id, name: '林知夏', phone: '13912345678', wechat: 'linzhixia_99', source: '小红书', skinType: '混干皮，鼻翼略卡粉', allergyNote: '对酒精类定妆喷雾轻微敏感', hairNote: '细软发质，需垫发根' },
  });
  const c2 = await prisma.client.create({
    data: { userId: user.id, name: '苏晚晴', phone: '13787654321', wechat: 'suwanqing', source: '老客转介绍', skinType: '中性健康肌', allergyNote: '无', hairNote: '发量适中，黑茶色长发' },
  });
  const c3 = await prisma.client.create({
    data: { userId: user.id, name: '陈思语', phone: '13655667788', wechat: 'siyu_chen', source: '婚礼纪', skinType: '油痘肌，需控油持妆', allergyNote: '眼周易流泪，胶水需温和型', hairNote: '齐肩短发，备真发接发片' },
  });
  const c4 = await prisma.client.create({
    data: { userId: user.id, name: '周念安', phone: '13599887766', wechat: 'nianan_zhou', source: '小红书', skinType: '干敏肌', allergyNote: '花粉过敏', hairNote: '长卷发' },
  });
  const c5 = await prisma.client.create({
    data: { userId: user.id, name: '许明月', phone: '13811223344', wechat: 'mingyue_xu', source: '摄影师推荐', skinType: '混油皮', allergyNote: '无', hairNote: '高颅顶黑长直' },
  });

  const defaultChecklist = JSON.stringify([
    { id: 'chk-1', label: '粉底液/遮瑕/定妆散粉', checked: true },
    { id: 'chk-2', label: '假睫毛/胶水/双眼皮贴', checked: true },
    { id: 'chk-3', label: '卷发棒/玉米须夹板/定型喷雾', checked: false },
    { id: 'chk-4', label: '新娘头饰/耳环/头纱', checked: false },
    { id: 'chk-5', label: '补妆包/吸油纸/棉签/湿巾', checked: false },
  ]);

  const now = dayjs('2026-11-26');
  const ym = now.format('YYYY-MM');

  // Orders in current month (2026-11)
  await prisma.order.create({
    data: {
      userId: user.id,
      clientId: c1.id,
      clientName: c1.name,
      clientPhone: c1.phone,
      title: '林知夏 · 新娘全天跟妆',
      serviceType: '新娘全天跟妆',
      serviceDate: `${ym}-26`,
      startTime: '05:30',
      endTime: '14:30',
      commuteMinutes: 40,
      location: '柏悦酒店 28层 湖景套房',
      status: 'LOCKED',
      basePrice: 3280,
      extraTotal: 760,
      discount: 0,
      totalAmount: 4040,
      depositPaid: 1500,
      balanceDue: 2540,
      assistantName: '小桃',
      assistantFee: 400,
      assistantPaid: false,
      channelCommission: 0,
      notes: '新娘偏好清透韩系水光肌，主纱配珍珠发箍，敬酒服为酒红色丝绒鱼尾。',
      skinType: c1.skinType,
      allergyNote: c1.allergyNote,
      checklistJson: defaultChecklist,
      extraItems: {
        create: [
          { name: '妈妈妆 / 伴娘妆', unitPrice: 280, quantity: 2, subtotal: 560 },
          { name: '早起费（6点前）', unitPrice: 200, quantity: 1, subtotal: 200 },
        ],
      },
      payments: {
        create: {
          userId: user.id,
          type: 'DEPOSIT',
          amount: 1500,
          channel: 'WECHAT',
          paidAt: dayjs('2026-11-05').toDate(),
          note: '微信定金锁档',
        },
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      clientId: c2.id,
      clientName: c2.name,
      clientPhone: c2.phone,
      title: '苏晚晴 · 领证/轻婚纱跟妆',
      serviceType: '领证/轻婚纱跟妆',
      serviceDate: `${ym}-26`,
      startTime: '16:30',
      endTime: '19:00',
      commuteMinutes: 30,
      location: '安缦法云 桂花庭院',
      status: 'RESERVED',
      basePrice: 980,
      extraTotal: 0,
      discount: 0,
      totalAmount: 980,
      depositPaid: 0,
      balanceDue: 980,
      notes: '口头预留，待付定金 300 元。',
      skinType: c2.skinType,
      checklistJson: defaultChecklist,
    },
  });

  // Multi-day destination wedding (2026-11-28 to 2026-11-29)
  await prisma.order.create({
    data: {
      userId: user.id,
      clientId: c3.id,
      clientName: c3.name,
      clientPhone: c3.phone,
      title: '陈思语 · 莫干山目的地跟妆（2天）',
      serviceType: '新娘全天跟妆',
      serviceDate: `${ym}-28`,
      endDate: `${ym}-29`,
      startTime: '06:00',
      endTime: '20:00',
      commuteMinutes: 90,
      location: '莫干山裸心堡 悬崖套房',
      status: 'LOCKED',
      basePrice: 3280,
      extraTotal: 1200,
      discount: 0,
      totalAmount: 4480,
      depositPaid: 2000,
      balanceDue: 2480,
      assistantName: '小桃',
      assistantFee: 600,
      assistantPaid: false,
      notes: '28日下午彩排试妆，29日草坪婚礼全天跟妆。高铁往返已报销。',
      skinType: c3.skinType,
      allergyNote: c3.allergyNote,
      checklistJson: defaultChecklist,
      extraItems: {
        create: [{ name: '外地出差补贴/天', unitPrice: 600, quantity: 2, subtotal: 1200 }],
      },
      payments: {
        create: {
          userId: user.id,
          type: 'DEPOSIT',
          amount: 2000,
          channel: 'ALIPAY',
          paidAt: dayjs('2026-11-10').toDate(),
          note: '外地跟妆定金',
        },
      },
    },
  });

  // Earlier settled orders in November 2026
  await prisma.order.create({
    data: {
      userId: user.id,
      clientId: c4.id,
      clientName: c4.name,
      clientPhone: c4.phone,
      title: '周念安 · 新娘全天跟妆',
      serviceType: '新娘全天跟妆',
      serviceDate: `${ym}-08`,
      startTime: '05:00',
      endTime: '14:00',
      commuteMinutes: 35,
      location: '四季酒店 西子湖畔',
      status: 'SETTLED',
      basePrice: 3280,
      extraTotal: 560,
      discount: 100,
      totalAmount: 3740,
      depositPaid: 3740,
      balanceDue: 0,
      assistantName: '阿宁',
      assistantFee: 350,
      assistantPaid: true,
      notes: '已完美履约，客户好评转介绍两位新娘。',
      checklistJson: defaultChecklist,
      payments: {
        create: [
          { userId: user.id, type: 'DEPOSIT', amount: 1500, channel: 'WECHAT', paidAt: dayjs('2026-10-18').toDate(), note: '定金' },
          { userId: user.id, type: 'BALANCE', amount: 2240, channel: 'WECHAT', paidAt: dayjs('2026-11-08').toDate(), note: '尾款结清' },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      clientId: c5.id,
      clientName: c5.name,
      clientPhone: c5.phone,
      title: '许明月 · 商业广告/艺人妆造',
      serviceType: '商业广告/艺人妆造',
      serviceDate: `${ym}-15`,
      startTime: '08:30',
      endTime: '17:30',
      commuteMinutes: 45,
      location: '良渚艺术中心 影棚B',
      status: 'SETTLED',
      basePrice: 2400,
      extraTotal: 0,
      discount: 0,
      totalAmount: 2400,
      depositPaid: 2400,
      balanceDue: 0,
      notes: '秋冬羊绒大衣画册拍摄，共 4 套造型。',
      checklistJson: defaultChecklist,
      payments: {
        create: { userId: user.id, type: 'BALANCE', amount: 2400, channel: 'BANK', paidAt: dayjs('2026-11-16').toDate(), note: '对公结算' },
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      clientId: c2.id,
      clientName: '顾清欢',
      clientPhone: '13966778899',
      title: '顾清欢 · 新娘精致早妆',
      serviceType: '新娘精致早妆',
      serviceDate: `${ym}-21`,
      startTime: '06:00',
      endTime: '10:30',
      commuteMinutes: 30,
      location: '君悦酒店 湖景房',
      status: 'COMPLETED',
      basePrice: 1680,
      extraTotal: 280,
      discount: 0,
      totalAmount: 1960,
      depositPaid: 800,
      balanceDue: 1160,
      notes: '服务已完成，待结清尾款 1160 元。',
      checklistJson: defaultChecklist,
      payments: {
        create: { userId: user.id, type: 'DEPOSIT', amount: 800, channel: 'WECHAT', paidAt: dayjs('2026-11-01').toDate(), note: '定金' },
      },
    },
  });

  // Historical orders (June - October 2026) for 6-month trend chart
  const historical = [
    { date: '2026-06-14', name: '沈佳宁', type: '新娘全天跟妆', amount: 14800 },
    { date: '2026-07-19', name: '唐微凉', type: '商业广告/艺人妆造', amount: 11200 },
    { date: '2026-08-22', name: '宋知意', type: '新娘全天跟妆', amount: 18600 },
    { date: '2026-09-26', name: '江晚吟', type: '新娘全天跟妆', amount: 22400 },
    { date: '2026-10-03', name: '陆星河', type: '新娘全天跟妆', amount: 28500 },
  ];

  for (const h of historical) {
    await prisma.order.create({
      data: {
        userId: user.id,
        clientName: h.name,
        title: `${h.name} · ${h.type}`,
        serviceType: h.type,
        serviceDate: h.date,
        startTime: '06:00',
        endTime: '14:00',
        location: '杭州城中香格里拉',
        status: 'SETTLED',
        basePrice: h.amount,
        totalAmount: h.amount,
        depositPaid: h.amount,
        balanceDue: 0,
        payments: {
          create: {
            userId: user.id,
            type: 'BALANCE',
            amount: h.amount,
            channel: 'WECHAT',
            paidAt: dayjs(h.date).toDate(),
            note: '历史订单结清',
          },
        },
      },
    });
  }

  // Blocked dates
  await prisma.blockedDate.createMany({
    data: [
      { userId: user.id, date: `${ym}-27`, reason: '休整备品' },
      { userId: user.id, date: `${ym}-30`, reason: '进修课程' },
    ],
  });

  // Expenses in Nov 2026
  await prisma.expense.createMany({
    data: [
      { userId: user.id, category: '耗材采购', amount: 1280, incurredAt: dayjs('2026-11-04').toDate(), note: 'CPB隔离、NARS散粉、一次性粉扑补货' },
      { userId: user.id, category: '交通打车', amount: 265, incurredAt: dayjs('2026-11-15').toDate(), note: '早妆往返专车费' },
      { userId: user.id, category: '助理费用', amount: 350, incurredAt: dayjs('2026-11-08').toDate(), note: '阿宁全天跟妆助理费' },
    ],
  });

  console.log('✅ Seed completed! Demo account: luna / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
