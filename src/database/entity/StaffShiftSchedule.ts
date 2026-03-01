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

@Entity("staff_shift_schedule")
export class StaffShiftSchedule {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "employee_id" })
  employeeId!: string;

  @ManyToOne("Employee", "shiftSchedules", { onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ type: "integer", name: "day_of_week" })
  dayOfWeek!: number;

  @Column({ type: "time", name: "start_time" })
  startTime!: string;

  @Column({ type: "time", name: "end_time" })
  endTime!: string;

  @Column({ type: "date", name: "effective_from" })
  effectiveFrom!: string;

  @Column({ type: "date", name: "effective_to", nullable: true })
  effectiveTo!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
