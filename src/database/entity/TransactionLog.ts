import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("transaction_logs")
export class TransactionLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, name: "trans_id", comment: "External/billing transaction ID" })
  transId!: string;

  @Column({ type: "varchar", length: 30, comment: "pending, completed, failed, refunded, etc." })
  status!: string;

  @Column({ type: "varchar", length: 50, nullable: true, comment: "Current step in the billing flow" })
  step!: string | null;

  @Column({ type: "varchar", length: 20, name: "response_code", nullable: true })
  responseCode!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "jsonb", nullable: true, comment: "Payload or response data" })
  data!: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
