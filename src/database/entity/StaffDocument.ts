import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Employee } from "./Employee";

@Entity("staff_documents")
export class StaffDocument {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "employee_id" })
  employeeId!: string;

  @ManyToOne("Employee", "documents", { onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ type: "varchar", length: 50, name: "document_type" })
  documentType!: string;

  @Column({ type: "varchar", length: 500, name: "file_path" })
  filePath!: string;

  @Column({ type: "varchar", length: 255, name: "file_name", nullable: true })
  fileName!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
