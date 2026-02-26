import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/database/connection";
import { User } from "@/database/entity/User";
import * as bcrypt from "bcryptjs";
import { seedUsers, getSeedUserByEmail } from "@/seed/load-seed";
import { isRole } from "@/helpers/roles";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // 1. Try database first
    try {
      const ds = await getConnection();
      const repo = ds.getRepository(User);
      const user = await repo.findOne({ where: { email: email.toLowerCase() } });
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const token = uuidv4();
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            token,
          },
          fromLocal: false,
        });
      }
      if (user) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
    } catch (_dbError) {
      // DB unavailable; fall back to seed data
    }

    // 2. Fallback to seed (local) data
    const seedUser = getSeedUserByEmail(email);
    if (seedUser && seedUser.password === password) {
      if (!isRole(seedUser.role)) {
        return NextResponse.json({ error: "Invalid role in seed" }, { status: 500 });
      }
      const token = uuidv4();
      return NextResponse.json({
        user: {
          id: seedUser.id,
          email: seedUser.email,
          name: seedUser.name,
          role: seedUser.role,
          token,
        },
        fromLocal: true,
      });
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
