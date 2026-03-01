import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

@Entity("menu_items")
export class MenuItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, name: "menu_precision", nullable: true, comment: "Precision or category of the menu item" })
  menuPrecision!: string | null;

  @Column({ type: "varchar", length: 100, comment: "Display name of the menu item" })
  name!: string;

  @Column({ type: "varchar", length: 50, nullable: true, comment: "Icon identifier for the menu item" })
  icon!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true, comment: "Route path for the menu item" })
  path!: string | null;

  @Column({ type: "varchar", length: 50, name: "menu_type", nullable: true, comment: "Type of menu (e.g., main, sidebar, quick-access)" })
  menuType!: string | null;

  @ManyToOne(() => MenuItem, (mi) => mi.children, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "parent_id" })
  parent!: MenuItem | null;

  @OneToMany(() => MenuItem, (mi) => mi.parent)
  children!: MenuItem[];

  @Column({ type: "text", name: "med_permissions", nullable: true, comment: "JSON array or comma-separated list of required permissions" })
  medPermissions!: string | null;

  @Column({ type: "integer", name: "sort_order", default: 0, comment: "Order in which menu items should appear" })
  sortOrder!: number;

  @Column({ type: "boolean", name: "is_active", default: true, comment: "Whether the menu item is active/visible" })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
