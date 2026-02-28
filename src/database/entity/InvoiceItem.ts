import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Invoice } from "./Invoice";

@Entity("invoice_items")
export class InvoiceItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Invoice, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_id" })
  invoice!: Invoice;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "varchar", length: 50, nullable: true, comment: "consultation, lab, pharmacy, procedure, etc." })
  category!: string | null;

  @Column({ type: "integer", default: 1 })
  quantity!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "unit_price", default: 0 })
  unitPrice!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  amount!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
