import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import type { Role } from "./Role";
import type { Module } from "./Module";

@Entity("role_module_permissions")
@Unique("UQ_role_module", ["role", "module"])
export class RoleModulePermission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("Role", { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @ManyToOne("Module", "rolePermissions", { onDelete: "CASCADE" })
  @JoinColumn({ name: "module_id" })
  module!: Module;

  @Column({ type: "boolean", name: "can_create", default: false })
  canCreate!: boolean;

  @Column({ type: "boolean", name: "can_read", default: false })
  canRead!: boolean;

  @Column({ type: "boolean", name: "can_update", default: false })
  canUpdate!: boolean;

  @Column({ type: "boolean", name: "can_delete", default: false })
  canDelete!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
