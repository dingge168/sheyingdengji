// 数据库连接单例 (平台托管 Postgres · 版本化迁移)。
// 发布环境: 平台注入 postgres 连接串 → node-postgres 连托管库; 迁移已由平台
//   在发布切换前按 manifest 的 migrate 位执行完毕, 这里 **绝不** 跑任何 DDL。
//   (平台保证注入 — 供不出库时发布直接失败, 不存在生产降级路径。)
// 开发沙箱 / docker build 期: DATABASE_URL 为空 → PGlite (进程内 Postgres),
//   首次连接按 drizzle/ 版本化迁移幂等补齐 — 这让构建期 SSG 预渲染有表可查,
//   也让沙箱开发零外部依赖。
// 业务代码只 `await getDb()` — 禁止 new Pool / new PGlite / 手写 DDL。
import { mkdirSync } from "node:fs";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";

import * as schema from "@/db/schema";

type Db = ReturnType<typeof drizzleNodePg<typeof schema>>;

let _dbPromise: Promise<Db> | undefined;

async function init(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("postgres")) {
    return drizzleNodePg(url, { schema });
  }
  // 沙箱开发用工作区 data/ (不进发布制品); 构建容器里用 /data (随层丢弃)
  const dir =
    process.env.NODE_ENV === "production" ? "/data/pg" : "./data/pg";
  // PGlite 0.3.6 nodefs mkdir 不递归: 父目录不存在 → ENOENT, drizzle 包成 CREATE SCHEMA 失败
  mkdirSync(dir, { recursive: true });
  const db = drizzlePglite({ client: new PGlite(dir), schema });
  await migratePglite(db, { migrationsFolder: "./drizzle" });
  return db as unknown as Db;
}

export function getDb(): Promise<Db> {
  _dbPromise ??= init();
  return _dbPromise;
}
