import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import type { Role } from "./Role";
import { Employee } from "./Employee";

export type UserStatus = "active" | "inactive" | "suspended" | "pending";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 64, unique: true, name: "user_code", comment: "Auto-generated code used as salt for password hashing" })
  userCode!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, name: "password_hash" })
  passwordHash!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @ManyToOne("Role", "users", { eager: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @OneToOne(() => Employee, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee | null;

  @Column({ type: "varchar", length: 20, default: "'active'" })
  status!: UserStatus;

  @Column({ type: "timestamp", name: "activated_at", nullable: true })
  activatedAt!: Date | null;

  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
