/**
 * Seed script: loads seed/data/*.json and inserts users into the database.
 * Run with: npm run db:seed
 * Requires DB connection. For local-only login, the app uses the same JSON files.
 */

import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { AppDataSource } from "../database/data-source";
import { User } from "../database/entity/User";
import { Role } from "../database/entity/Role";
import { Facility } from "../database/entity/Facility";
import * as bcrypt from "bcryptjs";

const SEED_DIR = path.join(__dirname, "data");

interface SeedUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

interface SeedFacility {
  id: string;
  code: string;
  name: string;
  facilityType: string;
  address: string;
  phone: string;
  email: string;
  district: string;
  region: string;
  description: string;
  facilityAdminId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

async function run() {
  const usersPath = path.join(SEED_DIR, "users.json");
  const facilitiesPath = path.join(SEED_DIR, "facilities.json");

  const rawUsers = fs.readFileSync(usersPath, "utf-8");
  const rawFacilities = fs.readFileSync(facilitiesPath, "utf-8");

  const users: SeedUser[] = JSON.parse(rawUsers);
  const facilities: SeedFacility[] = JSON.parse(rawFacilities);

  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(User);

  // Seed Users
  for (const u of users) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (existing) {
      console.log("Skip user (exists):", u.email);
      continue;
    }
    const role = await roleRepo.findOne({ where: { name: u.role } });
    if (!role) {
      console.warn("Skip user (role not found):", u.email, u.role);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    const userCode = crypto.randomBytes(32).toString("hex").slice(0, 64);
    const user = userRepo.create({
      userCode,
      email: u.email,
      passwordHash: hash,
      name: u.name,
      role,
    });
    await userRepo.save(user);
    console.log("Created user:", u.email, u.role);
  }

  // Seed Facilities
  const facilityRepo = AppDataSource.getRepository(Facility);
  for (const f of facilities) {
    const existing = await facilityRepo.findOne({ where: { code: f.code } });
    if (existing) {
      console.log("Skip facility (exists):", f.code, f.name);
      continue;
    }
    const facility = facilityRepo.create({
      code: f.code,
      name: f.name,
      facilityType: f.facilityType as import("../database/entity/Facility").FacilityType | null,
      address: f.address,
      phone: f.phone,
      email: f.email,
      district: f.district,
      region: f.region,
      description: f.description,
      facilityAdminId: f.facilityAdminId,
      isActive: f.isActive,
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
      deletedAt: f.deletedAt ? new Date(f.deletedAt) : null,
    });
    await facilityRepo.save(facility);
    console.log("Created facility:", f.code, f.name);
  }

  await AppDataSource.destroy();
  console.log("Seed done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
