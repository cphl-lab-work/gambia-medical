import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export type AppointmentStatus = "pending_payment" | "paid" | "scheduled" | "in_progress" | "completed";

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, name: "patient_name" })
  patientName!: string;

  @Column({ type: "varchar", length: 100, name: "patient_id", nullable: true })
  patientId!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  reason!: string | null;

  @Column({ type: "varchar", length: 255, name: "preferred_doctor", nullable: true })
  preferredDoctor!: string | null;

  @Column({ type: "varchar", length: 50 })
  status!: AppointmentStatus;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "appointment_fee", default: 0 })
  appointmentFee!: string;

  @Column({ type: "timestamp", name: "paid_at", nullable: true })
  paidAt!: Date | null;

  @Column({ type: "varchar", length: 255, name: "allocated_doctor", nullable: true })
  allocatedDoctor!: string | null;

  @Column({ type: "date", name: "allocated_date", nullable: true })
  allocatedDate!: string | null;

  @Column({ type: "varchar", length: 10, name: "allocated_time", nullable: true })
  allocatedTime!: string | null;

  @Column({ type: "varchar", length: 100, name: "booked_by" })
  bookedBy!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
