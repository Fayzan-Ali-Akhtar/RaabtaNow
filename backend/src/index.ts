/* ============================================================================
 * src/index.ts ― entry point for RaabtaNow backend
 * Uses AWS Secrets Manager (JSON secret) → validates → boots Sequelize & Express
 * ========================================================================== */

import express   from "express";
import cors      from "cors";
import path      from "path";

import { fetchSecrets }  from "./utils/secrets";
import { makeSequelize } from "./db/sequelize";
import { DbCfg }         from "./db/types";     // { DB_USERNAME, DB_PASSWORD, … }

import userRouter        from "./routes/userRoute";
import { jobRouter }     from "./routes/jobRoute";
import { profileRouter } from "./routes/profileRoute";
import Resumerouter      from "./routes/resumeRoute";
import LikeRouter        from "./routes/likeRoute";
import CommentRouter     from "./routes/commentRoute";

import User from "./models/userModel";
import Job  from "./models/jobModel";

/* ─────────────────────────  CONFIG  ──────────────────────────── */
const app  = express();
const port = Number(process.env.PORT) || 3000;

/* ─────────────────────────  BOOTSTRAP  ───────────────────────── */
(async () => {
  /* 1) Secrets → validate & init Sequelize ---------------------- */
  const raw = await fetchSecrets();                         // Record<string,string>

  const must: (keyof DbCfg)[] = [
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_ENDPOINT",
    "DB_NAME",
  ];
  for (const k of must) {
    if (!raw[k]) throw new Error(`❌ secret key missing: ${k}`);
  }

  const cfg = raw as unknown as DbCfg;                      // safe after the loop
  const sequelize = makeSequelize(cfg);

  /* (optional) expose to legacy code expecting process.env.* */
  Object.assign(process.env, cfg);

  /* 2) Sequelize model relations ------------------------------- */
  User.hasMany(Job, { foreignKey: "author_id", as: "jobs" });
  Job.belongsTo(User, { foreignKey: "author_id", as: "author" });

  /* 3) Express middleware & routes ----------------------------- */
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use("/api",
    userRouter,
    jobRouter,
    profileRouter,
    Resumerouter,
    LikeRouter,
    CommentRouter);

  /* health-check */
  app.get("/", async (_req, res) => {
    try {
      await sequelize.authenticate();
      res.status(200).send("✅ Backend & DB up " + new Date().toISOString());
    } catch {
      res.status(500).send("❌ DB unreachable " + new Date().toISOString());
    }
  });

  /* 4) Start server only after DB ready ------------------------ */
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    await sequelize.sync({ alter: true });
    console.log("✅ All tables synced");

    app.listen(port, () =>
      console.log(`🚀 Server listening on http://localhost:${port}`),
    );
  } catch (err) {
    console.error("❌ Failed DB init:", err);
    process.exit(1);
  }
})();
