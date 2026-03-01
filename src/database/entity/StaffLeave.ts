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
import type { User } from "./User";

@Entity("staff_leave")
export class StaffLeave {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "employee_id" })
  employeeId!: string;

  @ManyToOne("Employee", "leaveRecords", { onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ type: "varchar", length: 50, name: "leave_type" })
  leaveType!: string;

  @Column({ type: "date", name: "start_date" })
  startDate!: string;

  @Column({ type: "date", name: "end_date" })
  endDate!: string;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: string;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "uuid", name: "approved_by_id", nullable: true })
  approvedById!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL" })
  @JoinColumn({ name: "approved_by_id" })
  approvedBy!: User | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
