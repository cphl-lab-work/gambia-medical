import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Employee } from "./Employee";
import { User } from "./User";

@Entity("staff_performance_notes")
export class StaffPerformanceNote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "employee_id" })
  employeeId!: string;

  @ManyToOne(() => Employee, (e) => e.performanceNotes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ type: "date", name: "note_date" })
  noteDate!: string;

  @Column({ type: "text" })
  note!: string;

  @Column({ type: "uuid", name: "recorded_by_id", nullable: true })
  recordedById!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "recorded_by_id" })
  recordedBy!: User | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
