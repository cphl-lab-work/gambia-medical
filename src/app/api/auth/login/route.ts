import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { getSeedUserByEmail } from "@/seed/load-seed";
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

    // 1. Try seed first (no DB dependency - works even if Postgres/TypeORM fails)
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

    // 2. Try database (deferred import - only loads TypeORM when needed)
    try {
      const { getConnection } = await import("@/database/connection");
      const { User } = await import("@/database/entity/User");
      const ds = await getConnection();
      const repo = ds.getRepository(User);
      const user = await repo.findOne({
        where: { email: email.toLowerCase() },
        relations: ["employee"],
      });
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const token = uuidv4();
        const roleStr =
          typeof user.role === "object" && user.role != null && "code" in user.role
            ? String((user.role as { code?: string }).code ?? "").toLowerCase()
            : typeof user.role === "string"
              ? user.role
              : "admin";
        const employee = user.employee as { id?: string } | null | undefined;
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: roleStr || "admin",
            token,
            staffId: employee?.id ?? null,
            employeeId: employee?.id ?? null,
          },
          fromLocal: false,
        });
      }
      if (user) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
    } catch (_dbError) {
      // DB unavailable - already tried seed above
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
