import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export type PrescriptionStatus = "pending" | "dispensed";

@Entity("prescriptions")
export class Prescription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, name: "patient_name" })
  patientName!: string;

  @Column({ type: "varchar", length: 100, name: "patient_id", nullable: true })
  patientId!: string | null;

  @Column({ type: "uuid", name: "appointment_id", nullable: true })
  appointmentId!: string | null;

  @Column({ type: "varchar", length: 255 })
  medication!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  dosage!: string | null;

  @Column({ type: "text", nullable: true })
  instructions!: string | null;

  @Column({ type: "varchar", length: 255, name: "prescribed_by" })
  prescribedBy!: string;

  @Column({ type: "varchar", length: 50 })
  status!: PrescriptionStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
