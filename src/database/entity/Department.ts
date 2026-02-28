import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 20, nullable: true, comment: "Short code e.g. OPD, LAB, PHAR" })
  code!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "uuid", name: "head_of_department_id", nullable: true, comment: "FK to users" })
  headOfDepartmentId!: string | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
