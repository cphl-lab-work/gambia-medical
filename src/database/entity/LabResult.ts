import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { LabOrder } from "./LabOrder";

@Entity("lab_results")
export class LabResult {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => LabOrder, { onDelete: "CASCADE" })
  @JoinColumn({ name: "lab_order_id" })
  labOrder!: LabOrder;

  @Column({ type: "varchar", length: 255, name: "parameter_name", comment: "e.g. Hemoglobin, WBC" })
  parameterName!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  value!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  unit!: string | null;

  @Column({ type: "varchar", length: 100, name: "reference_range", nullable: true })
  referenceRange!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true, comment: "Normal, Low, High, Critical" })
  flag!: string | null;

  @Column({ type: "text", nullable: true })
  remarks!: string | null;

  @Column({ type: "uuid", name: "verified_by", nullable: true, comment: "FK to users (lab tech)" })
  verifiedBy!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
