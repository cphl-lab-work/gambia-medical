import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Patient } from "./Patient";
import { Encounter } from "./Encounter";

export type InvoiceStatus = "draft" | "pending" | "partially_paid" | "paid" | "cancelled" | "refunded";

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true, name: "invoice_number" })
  invoiceNumber!: string;

  @ManyToOne(() => Patient, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;

  @ManyToOne(() => Encounter, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "encounter_id" })
  encounter!: Encounter | null;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "total_amount", default: 0 })
  totalAmount!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "paid_amount", default: 0 })
  paidAmount!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  discount!: string;

  @Column({ type: "varchar", length: 30, default: "'draft'" })
  status!: InvoiceStatus;

  @Column({ type: "varchar", length: 50, name: "payment_method", nullable: true, comment: "Cash, Card, Insurance, Mobile Money" })
  paymentMethod!: string | null;

  @Column({ type: "varchar", length: 255, name: "insurance_claim_ref", nullable: true })
  insuranceClaimRef!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "uuid", name: "created_by", nullable: true, comment: "FK to users" })
  createdBy!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
