import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Role } from "./Role";
import { MenuItem } from "./MenuItem";

@Entity("role_menu_items")
@Unique("UQ_role_menu_item", ["role", "menuItem"])
export class RoleMenuItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Role, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @ManyToOne(() => MenuItem, { onDelete: "CASCADE" })
  @JoinColumn({ name: "menu_item_id" })
  menuItem!: MenuItem;

  @Column({ type: "boolean", name: "can_view", default: true, comment: "Whether the role can see this menu item" })
  canView!: boolean;

  @Column({ type: "boolean", name: "can_access", default: true, comment: "Whether the role can navigate to this menu item" })
  canAccess!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
