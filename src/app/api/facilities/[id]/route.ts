import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/database/data-source";
import { Facility } from "@/database/entity/Facility";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const facilityId = params.id;
    const body = await request.json();
    const { name, code, facilityType, address, phone, email, description, facilityAdminId } =
      body;

    if (!name || !code) {
      return NextResponse.json(
        { message: "Name and code are required" },
        { status: 400 }
      );
    }

    const facilityRepository = AppDataSource.getRepository(Facility);
    const facility = await facilityRepository.findOne({ where: { id: facilityId } });

    if (!facility) {
      return NextResponse.json(
        { message: "Facility not found" },
        { status: 404 }
      );
    }

    // Check if code is being changed and already exists
    if (code !== facility.code) {
      const existing = await facilityRepository.findOne({ where: { code } });
      if (existing) {
        return NextResponse.json(
          { message: "Facility code already exists" },
          { status: 400 }
        );
      }
    }

    facility.name = name;
    facility.code = code;
    facility.facilityType = facilityType || null;
    facility.address = address || null;
    facility.phone = phone || null;
    facility.email = email || null;
    facility.description = description || null;
    facility.facilityAdminId = facilityAdminId || null;

    await facilityRepository.save(facility);

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Error updating facility:", error);
    return NextResponse.json(
      { message: "Error updating facility" },
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

    const facilityId = params.id;

    const facilityRepository = AppDataSource.getRepository(Facility);
    const facility = await facilityRepository.findOne({ where: { id: facilityId } });

    if (!facility) {
      return NextResponse.json(
        { message: "Facility not found" },
        { status: 404 }
      );
    }

    // Soft delete - set deletedAt timestamp
    facility.deletedAt = new Date();
    await facilityRepository.save(facility);

    return NextResponse.json({ message: "Facility deleted successfully" });
  } catch (error) {
    console.error("Error deleting facility:", error);
    return NextResponse.json(
      { message: "Error deleting facility" },
      { status: 500 }
    );
  }
}
