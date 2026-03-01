import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/database/data-source";
import { Facility } from "@/database/entity/Facility";

export async function GET() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const facilityRepository = AppDataSource.getRepository(Facility);
    const facilities = await facilityRepository.find({
      order: { createdAt: "DESC" },
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { message: "Error fetching facilities" },
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
    const { name, code, facilityType, address, phone, email, description, facilityAdminId } =
      body;

    if (!name || !code) {
      return NextResponse.json(
        { message: "Name and code are required" },
        { status: 400 }
      );
    }

    const facilityRepository = AppDataSource.getRepository(Facility);

    // Check if code already exists
    const existing = await facilityRepository.findOne({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { message: "Facility code already exists" },
        { status: 400 }
      );
    }

    const facility = facilityRepository.create({
      name,
      code,
      facilityType: facilityType || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      description: description || null,
      facilityAdminId: facilityAdminId || null,
      isActive: true,
      deletedAt: null,
    });

    await facilityRepository.save(facility);

    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error("Error creating facility:", error);
    return NextResponse.json(
      { message: "Error creating facility" },
      { status: 500 }
    );
  }
}
