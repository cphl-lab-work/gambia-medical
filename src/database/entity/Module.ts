import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { RoleModulePermission } from "./RoleModulePermission";

@Entity("modules")
export class Module {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 100, name: "display_name" })
  displayName!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  icon!: string | null;

  @Column({ type: "integer", name: "sort_order", default: 0 })
  sortOrder!: number;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany("RoleModulePermission", "module")
  rolePermissions!: RoleModulePermission[];
}
