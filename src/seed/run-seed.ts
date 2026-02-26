/**
 * Seed script: loads seed/data/*.json and inserts users into the database.
 * Run with: npm run db:seed
 * Requires DB connection. For local-only login, the app uses the same JSON files.
 */

import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import { AppDataSource } from "../database/data-source";
import { User } from "../database/entity/User";
import * as bcrypt from "bcryptjs";

const SEED_DIR = path.join(__dirname, "data");

interface SeedUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

async function run() {
  const usersPath = path.join(SEED_DIR, "users.json");
  const raw = fs.readFileSync(usersPath, "utf-8");
  const users: SeedUser[] = JSON.parse(raw);

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  for (const u of users) {
    const existing = await repo.findOne({ where: { email: u.email } });
    if (existing) {
      console.log("Skip (exists):", u.email);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    const user = repo.create({
      id: u.id,
      email: u.email,
      passwordHash: hash,
      name: u.name,
      role: u.role,
    });
    await repo.save(user);
    console.log("Created:", u.email, u.role);
  }

  await AppDataSource.destroy();
  console.log("Seed done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
