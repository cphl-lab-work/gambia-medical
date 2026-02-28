import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Department } from "./Department";

export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated" | "suspended";
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 20, unique: true, name: "employee_code", comment: "Auto-generated staff ID e.g. EMP-00001" })
  employeeCode!: string;

  @Column({ type: "varchar", length: 100, name: "first_name" })
  firstName!: string;

  @Column({ type: "varchar", length: 100, name: "last_name" })
  lastName!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  gender!: string | null;

  @Column({ type: "date", name: "date_of_birth", nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 100, name: "national_id", nullable: true, comment: "National ID / Passport number" })
  nationalId!: string | null;

  @Column({ type: "text", nullable: true })
  address!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  facility!: string | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "department_id" })
  department!: Department | null;

  @Column({ type: "varchar", length: 100, name: "job_title", nullable: true })
  jobTitle!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  specialisation!: string | null;

  @Column({ type: "varchar", length: 50, name: "employment_type", nullable: true, comment: "full_time, part_time, contract, intern" })
  employmentType!: EmploymentType | null;

  @Column({ type: "date", name: "date_joined", nullable: true })
  dateJoined!: string | null;

  @Column({ type: "varchar", length: 100, name: "license_number", nullable: true, comment: "Medical/professional license" })
  licenseNumber!: string | null;

  @Column({ type: "varchar", length: 255, name: "emergency_contact_name", nullable: true })
  emergencyContactName!: string | null;

  @Column({ type: "varchar", length: 50, name: "emergency_contact_phone", nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ type: "varchar", length: 20, default: "'active'" })
  status!: EmployeeStatus;

  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
