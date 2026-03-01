import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("pharmacy_stock")
export class PharmacyStock {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, name: "drug_name" })
  drugName!: string;

  @Column({ type: "varchar", length: 100, name: "generic_name", nullable: true })
  genericName!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true, comment: "Tablet, Capsule, Syrup, Injection, etc." })
  form!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true, comment: "e.g. 500mg, 250mg/5ml" })
  strength!: string | null;

  @Column({ type: "integer", name: "quantity_in_stock", default: 0 })
  quantityInStock!: number;

  @Column({ type: "integer", name: "reorder_level", default: 10 })
  reorderLevel!: number;

  @Column({ type: "varchar", length: 50, nullable: true, comment: "Pieces, Bottles, Packs" })
  unit!: string | null;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "unit_cost", default: 0 })
  unitCost!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "selling_price", default: 0 })
  sellingPrice!: string;

  @Column({ type: "varchar", length: 100, name: "batch_number", nullable: true })
  batchNumber!: string | null;

  @Column({ type: "date", name: "expiry_date", nullable: true })
  expiryDate!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  supplier!: string | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
