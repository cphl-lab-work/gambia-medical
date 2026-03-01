import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/database/data-source";
import { FacilityTeam } from "@/database/entity/FacilityTeam";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { id } = params;
    const body = await request.json();
    const { status, details } = body;

    const repo = AppDataSource.getRepository(FacilityTeam);
    const teamMember = await repo.findOne({ where: { id } });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    if (status) teamMember.status = status;
    if (details !== undefined) teamMember.details = details;

    await repo.save(teamMember);

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("Error updating facility team member:", error);
    return NextResponse.json(
      { error: "Failed to update facility team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { id } = params;

    const repo = AppDataSource.getRepository(FacilityTeam);
    const teamMember = await repo.findOne({ where: { id } });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Soft delete
    teamMember.deletedAt = new Date();
    await repo.save(teamMember);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting facility team member:", error);
    return NextResponse.json(
      { error: "Failed to delete facility team member" },
      { status: 500 }
    );
  }
}
