# 柔雾档期 · 化妆师档期与营收管理 H5（极简丝滑版）

面向自由化妆师与工作室的移动端优先（Mobile-First）全栈 H5 应用，支持 iPhone Safari 添加至主屏幕作为 PWA 运行。

## 快速启动

### 1. 启动后端（端口 `3001`）
```bash
cd backend
npm install
npx prisma generate && npx prisma db push && npm run prisma:seed
npm run dev
```

### 2. 启动前端（端口 `5173`）
```bash
cd frontend
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5173`，使用内置体验账号登录：
- 账号：`luna`
- 密码：`123456`

公开脱敏档期页示例：`http://localhost:5173/s/luna-studio-2026`
iPhone 日历订阅流：`http://localhost:3001/api/v1/public/calendar/luna-studio-2026.ics`
