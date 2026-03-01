import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Employee } from "./Employee";

@Entity("staff_attendance")
export class StaffAttendance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "employee_id" })
  employeeId!: string;

  @ManyToOne("Employee", "attendanceRecords", { onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "timestamp", name: "check_in", nullable: true })
  checkIn!: Date | null;

  @Column({ type: "timestamp", name: "check_out", nullable: true })
  checkOut!: Date | null;

  @Column({ type: "varchar", length: 20, default: "present" })
  status!: string;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
