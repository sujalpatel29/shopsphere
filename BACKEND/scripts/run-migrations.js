import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import "../configs/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../database/migrations");

const run = async () => {
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations folder not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.toLowerCase().endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No .sql migration files found.");
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number.parseInt(process.env.DB_PORT, 10) || 3306,
    multipleStatements: true,
  });

  console.log(
    `Connected to ${process.env.DB_NAME}@${process.env.DB_HOST}. Running ${files.length} migration(s)...`,
  );

  try {
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = fs.readFileSync(full, "utf8").trim();
      if (!sql) {
        console.log(`- ${file} (empty, skipped)`);
        continue;
      }
      process.stdout.write(`- ${file} ... `);
      try {
        await connection.query(sql);
        console.log("OK");
      } catch (err) {
        console.log("FAILED");
        console.error(`  ${err.code || ""} ${err.message}`);
        throw err;
      }
    }
    console.log("All migrations completed.");
  } finally {
    await connection.end();
  }
};

run().catch((err) => {
  console.error("Migration run aborted:", err.message);
  process.exit(1);
});
