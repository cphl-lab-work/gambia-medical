import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { Employee } from "./Employee";

@Entity("doctors")
export class Doctor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "staff_id" })
  staffId!: string;

  @OneToOne(() => Employee, (e) => e.doctorRecord, { onDelete: "CASCADE" })
  @JoinColumn({ name: "staff_id" })
  staff!: Employee;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
