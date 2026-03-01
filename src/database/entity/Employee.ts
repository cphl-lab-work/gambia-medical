import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import type { Department } from "./Department";
import type { User } from "./User";
import type { Doctor } from "./Doctor";
import type { StaffAttendance } from "./StaffAttendance";
import type { StaffLeave } from "./StaffLeave";
import type { StaffShiftSchedule } from "./StaffShiftSchedule";
import type { StaffPerformanceNote } from "./StaffPerformanceNote";
import type { StaffDocument } from "./StaffDocument";

export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated" | "suspended";
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";
export type StaffRole = "doctor" | "nurse" | "receptionist" | "pharmacist" | "lab_technician";

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 20, unique: true, name: "employee_code" })
  employeeCode!: string;

  // ——— Basic information ———
  @Column({ type: "varchar", length: 100, name: "first_name" })
  firstName!: string;

  @Column({ type: "varchar", length: 100, name: "last_name" })
  lastName!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  gender!: string | null;

  @Column({ type: "date", name: "date_of_birth", nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: "varchar", length: 100, name: "national_id", nullable: true })
  nationalId!: string | null;

  @Column({ type: "varchar", length: 500, name: "profile_photo", nullable: true })
  profilePhoto!: string | null;

  // ——— Contact ———
  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "text", nullable: true })
  address!: string | null;

  @Column({ type: "varchar", length: 255, name: "emergency_contact_name", nullable: true })
  emergencyContactName!: string | null;

  @Column({ type: "varchar", length: 50, name: "emergency_contact_phone", nullable: true })
  emergencyContactPhone!: string | null;

  // ——— Employment ———
  @Column({ type: "varchar", length: 50, name: "staff_role", nullable: true })
  staffRole!: StaffRole | string | null;

  @ManyToOne("Department", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "department_id" })
  department!: Department | null;

  @Column({ type: "varchar", length: 100, name: "job_title", nullable: true })
  jobTitle!: string | null;

  @Column({ type: "varchar", length: 50, name: "employment_type", nullable: true })
  employmentType!: EmploymentType | null;

  @Column({ type: "date", name: "date_joined", nullable: true })
  dateJoined!: string | null;

  @Column({ type: "varchar", length: 100, name: "work_shift", nullable: true })
  workShift!: string | null;

  @Column({ type: "varchar", length: 20, default: "active" })
  status!: EmployeeStatus;

  // ——— Professional ———
  @Column({ type: "text", nullable: true })
  qualifications!: string | null;

  @Column({ type: "varchar", length: 100, name: "license_number", nullable: true })
  licenseNumber!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  specialisation!: string | null;

  @Column({ type: "integer", name: "years_of_experience", nullable: true })
  yearsOfExperience!: number | null;

  @Column({ type: "text", nullable: true })
  certifications!: string | null;

  // ——— Payroll ———
  @Column({ type: "decimal", precision: 14, scale: 2, nullable: true })
  salary!: string | null;

  @Column({ type: "varchar", length: 50, name: "payment_method", nullable: true })
  paymentMethod!: string | null;

  @Column({ type: "varchar", length: 255, name: "bank_name", nullable: true })
  bankName!: string | null;

  @Column({ type: "varchar", length: 100, name: "bank_account_number", nullable: true })
  bankAccountNumber!: string | null;

  @Column({ type: "varchar", length: 50, name: "tax_identification_number", nullable: true })
  taxIdentificationNumber!: string | null;

  // ——— Medical staff specific ———
  @Column({ type: "decimal", precision: 14, scale: 2, name: "consultation_fee", nullable: true })
  consultationFee!: string | null;

  @Column({ type: "varchar", length: 255, name: "available_days", nullable: true })
  availableDays!: string | null;

  @Column({ type: "varchar", length: 100, name: "available_time", nullable: true })
  availableTime!: string | null;

  @Column({ type: "varchar", length: 100, name: "assigned_ward", nullable: true })
  assignedWard!: string | null;

  // ——— Legacy / optional ———
  @Column({ type: "varchar", length: 255, nullable: true })
  facility!: string | null;

  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // ——— Relations (all string-based to avoid circular imports) ———
  @OneToOne("User", "employee")
  user!: User | null;

  @OneToOne("Doctor", "staff")
  doctorRecord!: Doctor | null;

  @OneToMany("StaffAttendance", "employee")
  attendanceRecords!: StaffAttendance[];

  @OneToMany("StaffLeave", "employee")
  leaveRecords!: StaffLeave[];

  @OneToMany("StaffShiftSchedule", "employee")
  shiftSchedules!: StaffShiftSchedule[];

  @OneToMany("StaffPerformanceNote", "employee")
  performanceNotes!: StaffPerformanceNote[];

  @OneToMany("StaffDocument", "employee")
  documents!: StaffDocument[];
}
