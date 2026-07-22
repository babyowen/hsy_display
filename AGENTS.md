# AGENTS.md

> 本文件面向 AI 编码代理，假设读者对本项目一无所知。

## 项目概述

本项目（`hsy_display`）是一个展示**南京火烧云与空气质量预测**的单页网站，服务于南京地区拍摄日出日落的摄影爱好者。

- 数据来源：**飞书多维表格**（Bitable），表内数据由外部流程每天更新 4 次（1:40 / 8:40 / 13:40 / 20:40），原始预测数据来自 https://sunsetbot.top 。
- 完整需求文档见 `modread.md`（中文），其中包含飞书数据表字段定义、取值含义（`hsysz` 火烧云数值、`qrjsz` 气溶胶数值等）和官方 API 调用示例，修改数据逻辑前建议先读它。
- 页面结构（`src/app/page.tsx`）：顶部大图 Header → 近日预测高亮展示（LatestData）→ 本周历史表格（DataTable）→ 网站说明（Description）→ 页脚备案信息。

## 技术栈

- **框架**：Next.js 16（App Router）+ React 19 + TypeScript 5（strict 模式，开启了很多额外严格检查）
- **样式**：Tailwind CSS 3 + PostCSS + autoprefixer
- **数据获取**：客户端用 SWR 轮询内部 API；服务端用 `@larksuiteoapi/node-sdk` 查询飞书多维表格
- **其他**：date-fns（时间格式化）、lucide-react（图标）、sharp（图片优化）
- 无测试框架、无 CI 配置。

## 构建与运行命令

```bash
npm run dev         # 开发服务器，端口 3002（注意：不是默认的 3000）
npm run build       # 生产构建
npm start           # 生产服务器，端口 3002
npm run lint        # ESLint，--max-warnings=0（警告也会失败）
npm run type-check  # tsc --noEmit 类型检查
```

提交前请至少运行 `npm run lint` 和 `npm run type-check`，两者均需零告警通过。

### 环境变量

必须在项目根目录创建 `.env.local`（已被 gitignore，不要提交），`src/lib/env.ts` 启动时会校验以下变量，缺失会抛错：

```
FEISHU_APP_ID
FEISHU_APP_SECRET
FEISHU_APP_TOKEN
FEISHU_TABLE_ID
VIEW_ID
```

注意 `src/types/env.d.ts` 中写的是 `TABLE_ID`，但实际代码用的是 `FEISHU_TABLE_ID`——以 `src/lib/env.ts` 为准。

## 代码组织

```
src/
├── middleware.ts            # 给非 API 路由加 no-cache 响应头
├── app/
│   ├── layout.tsx           # 根布局，metadata（标题：南京火烧云）
│   ├── page.tsx             # 唯一页面（'use client'，SWR 拉取本周历史）
│   ├── globals.css
│   └── api/feishu/
│       ├── data/route.ts    # GET /api/feishu/data   今日+明日未来的预测（高亮展示用）
│       ├── history/route.ts # GET /api/feishu/history 本周历史数据
│       └── test/route.ts    # GET /api/feishu/test   连通性测试接口
├── components/              # 全部为客户端组件（'use client'）
│   ├── Header.tsx           # 顶部大图（public/images/cover）
│   ├── LatestData.tsx       # 近日预测卡片，数值红/绿高亮
│   ├── DataTable.tsx        # 本周历史表格
│   ├── Description.tsx      # 网站说明文案
│   └── LoadingState / ErrorMessage / EmptyState
├── lib/
│   ├── env.ts               # 环境变量读取与校验（唯一权威来源）
│   ├── feishu.ts            # 飞书 SDK 客户端工厂与请求参数类型
│   ├── types.ts             # FeishuResponse 类型（API 响应结构）
│   ├── utils.ts             # fetcher（SWR 用）、formatDate、cn
│   ├── colors.ts            # 火烧云/气溶胶数值的展示颜色（getHsyszColor / getQrjszColor）
│   └── feishu-types.ts / sdk-types.ts  # 早期遗留的类型定义
└── types/env.d.ts           # ProcessEnv 声明（注意与 lib/env.ts 不一致，见上）
```

### 数据流架构

1. 客户端组件（SWR，`fetcher` 在 `src/lib/utils.ts`）→ 请求内部 API 路由；
2. API 路由（均为 `force-dynamic` + `revalidate = 0`，禁缓存）→ 用飞书 SDK 的 `bitable.appTableRecord.search` 查多维表格；
3. 服务端完成过滤/去重（同一 `datetime` 只保留 `updatetime` 最新的记录），并附加 `formatted_datetime` / `formatted_updatetime` 中文字段后返回。

飞书表字段：`datetime`（事件时间戳）、`type`（日出/日落）、`hsysz`（火烧云数值，字符串）、`hsypj`（火烧云评价，`{text}[]`）、`qrjsz`（气溶胶数值，字符串）、`kqzl`（空气质量评价，`{text}[]`）、`updatetime`（更新时间戳）。**注意 `hsysz`/`qrjsz` 在表里是字符串，`hsypj`/`kqzl` 是文本对象数组**，处理类型时不要想当然改成 number/string。

## 代码风格约定

- 所有用户可见文案、代码注释、日志输出均使用**中文**；日志格式带随机 sessionId 前缀，如 `[abc123] 近日预测 | 开始查询`。
- 路径别名：`@/*` → `./src/*`。
- TypeScript 非常严格：`noUnusedLocals`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes` 等均开启，写代码时注意。
- ESLint 规则：`@typescript-eslint/no-unused-vars`（`_` 前缀豁免）、`no-explicit-any` 为 warn，但 lint 以 `--max-warnings=0` 运行，**等于禁止警告**。
- 数值颜色约定：统一从 `src/lib/colors.ts` 导入 `getHsyszColor`/`getQrjszColor`（原先在 LatestData/DataTable 中重复定义，已抽取）。火烧云数值偏高用红色（red-400）、偏低用绿色；气溶胶 >0.8 用浅色（深色主题下原先的"黑色"不可见）、>0.4 紫色、其余绿色系。
- 整站为深色"大气观测站"设计系统：`dusk`（深夜蓝底）/`ember`（火烧云橙红强调）色板定义在 `tailwind.config.ts`，通用样式类（`.glass-panel` 玻璃拟态、`.font-mono-num` 等宽数字、`.bg-tech-grid`、`.noise-overlay`、`.text-ember-gradient`）定义在 `globals.css`。`tailwind.config.ts` 的 `content` 必须包含 `./src/lib/**`，否则 colors.ts 中的颜色类不会生成。
- API 路由查询参数用 `satisfies Lark.BitableRequestParams` 标注。

## 注意事项与已知坑

- **存在重复/遗留配置文件**：`next.config.js` 与 `next.config.ts`、`postcss.config.js` 与 `postcss.config.mjs`、`.eslintrc.json` 与 `eslint.config.mjs` 并存。当前生效的是 `.js` / `.mjs` 组合（Next 16 + ESLint 9 flat config）。改动配置时注意确认哪个生效，理想情况下应清理但暂保持现状。
- `modread.md` 中含有**硬编码的飞书 app_token、table_id 和已过期的 tenant token**，仅作文档参考；真实凭证一律走 `.env.local` 环境变量，不要把密钥写进代码或提交。
- 页面整体禁缓存：`middleware.ts` 对非 API 路径加 no-store 头，layout metadata 也声明了 no-cache，API 路由 `force-dynamic`。调试时若数据不更新，先怀疑飞书侧而非缓存。
- 无测试：项目没有任何测试框架和测试文件，验证靠 `npm run lint` + `npm run type-check` + 本地起 `npm run dev` 访问 `http://localhost:3002` 手动确认；`/api/feishu/test` 可用于验证飞书连接。
- 部署：标准 Next.js 应用（README 为 Vercel 模板原文），`npm run build && npm start`（3002 端口）即可运行；页脚含 ICP 备案链接，面向中国大陆部署。
