import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/database/data-source";
import { User } from "@/database/entity/User";

export async function GET(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const url = new URL(request.url);
    const roleFilter = url.searchParams.get("role");

    const userRepository = AppDataSource.getRepository(User);
    let query = userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("user.deletedAt IS NULL");

    if (roleFilter) {
      query = query.andWhere("role.name = :role", { role: roleFilter });
    }

    const users = await query
      .orderBy("user.name", "ASC")
      .getMany();

    // Map to include role information
    const mappedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
    }));

    return NextResponse.json(mappedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
