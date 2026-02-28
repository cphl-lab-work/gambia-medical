import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Encounter } from "./Encounter";

export type LabOrderStatus = "pending" | "sample_collected" | "processing" | "completed" | "cancelled";

@Entity("lab_orders")
export class LabOrder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true, name: "order_number" })
  orderNumber!: string;

  @ManyToOne(() => Encounter, { onDelete: "CASCADE" })
  @JoinColumn({ name: "encounter_id" })
  encounter!: Encounter;

  @Column({ type: "varchar", length: 255, name: "test_name" })
  testName!: string;

  @Column({ type: "varchar", length: 100, name: "test_category", nullable: true, comment: "Hematology, Biochemistry, Microbiology, etc." })
  testCategory!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true, comment: "Normal, Urgent, STAT" })
  priority!: string | null;

  @Column({ type: "varchar", length: 30, default: "'pending'" })
  status!: LabOrderStatus;

  @Column({ type: "uuid", name: "ordered_by", nullable: true, comment: "FK to users (doctor)" })
  orderedBy!: string | null;

  @Column({ type: "text", name: "clinical_info", nullable: true })
  clinicalInfo!: string | null;

  @Column({ type: "timestamp", name: "sample_collected_at", nullable: true })
  sampleCollectedAt!: Date | null;

  @Column({ type: "timestamp", name: "completed_at", nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
