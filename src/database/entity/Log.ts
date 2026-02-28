import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("logs")
export class Log {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "user_id", nullable: true, comment: "User who performed or is subject of the operation" })
  userId!: string | null;

  @Column({ type: "varchar", length: 255, name: "client_id", nullable: true, comment: "Client/session identifier" })
  clientId!: string | null;

  @Column({ type: "varchar", length: 50, name: "operation_type", comment: "login, logout, create, read, update, delete, etc." })
  operationType!: string;

  @Column({ type: "varchar", length: 100, name: "table_name", nullable: true, comment: "Affected table/entity" })
  tableName!: string | null;

  @Column({ type: "varchar", length: 50, name: "user_type", nullable: true, comment: "admin, doctor, nurse, etc." })
  userType!: string | null;

  @Column({ type: "uuid", name: "record_id", nullable: true, comment: "ID of the affected record" })
  recordId!: string | null;

  @Column({ type: "uuid", name: "executed_by", nullable: true, comment: "User who executed the operation" })
  executedBy!: string | null;

  @Column({ type: "text", name: "operation_query", nullable: true })
  operationQuery!: string | null;

  @Column({ type: "jsonb", name: "old_data", nullable: true })
  oldData!: Record<string, unknown> | null;

  @Column({ type: "jsonb", name: "new_data", nullable: true })
  newData!: Record<string, unknown> | null;

  @Column({ type: "varchar", length: 45, name: "ip_address", nullable: true })
  ipAddress!: string | null;

  @Column({ type: "varchar", length: 20, default: "'success'", comment: "success, failed, error" })
  status!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
