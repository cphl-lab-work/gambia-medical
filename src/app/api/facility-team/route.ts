import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/database/data-source";
import { FacilityTeam } from "@/database/entity/FacilityTeam";
import { IsNull } from "typeorm";

export async function GET(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");

    const query = AppDataSource.getRepository(FacilityTeam)
      .createQueryBuilder("ft")
      .where("ft.deletedAt IS NULL");

    if (facilityId) {
      query.andWhere("ft.facilityId = :facilityId", { facilityId });
    }

    const teamMembers = await query
      .orderBy("ft.createdAt", "DESC")
      .getMany();

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching facility team:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility team" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const body = await request.json();
    const { staffId, facilityId, status = "active", details } = body;

    if (!staffId || !facilityId) {
      return NextResponse.json(
        { error: "staffId and facilityId are required" },
        { status: 400 }
      );
    }

    const repo = AppDataSource.getRepository(FacilityTeam);

    // Check if staff is already assigned to this facility
    const existing = await repo.findOne({
      where: {
        staffId,
        facilityId,
        deletedAt: IsNull(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Staff member already assigned to this facility" },
        { status: 400 }
      );
    }

    const teamMember = repo.create({
      staffId,
      facilityId,
      status,
      details: details || null,
    });

    await repo.save(teamMember);

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error("Error creating facility team member:", error);
    return NextResponse.json(
      { error: "Failed to create facility team member" },
      { status: 500 }
    );
  }
}
