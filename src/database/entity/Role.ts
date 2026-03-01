import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";

export type RoleStatus = "active" | "inactive";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 20, unique: true, nullable: true, comment: "Uppercase short code e.g. ADMIN, DOCTOR" })
  code!: string | null;

  @Column({ type: "varchar", length: 255, name: "display_name", nullable: true })
  displayName!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text", nullable: true, comment: "JSON array of permission strings" })
  permissions!: string | null;

  @Column({ type: "boolean", name: "is_system_role", default: false, comment: "System roles cannot be deleted" })
  isSystemRole!: boolean;

  @Column({ type: "varchar", length: 20, default: "'active'" })
  status!: RoleStatus;

  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany("User", "role")
  users!: User[];
}
