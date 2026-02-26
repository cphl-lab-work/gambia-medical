import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("patient_clerking")
export class PatientClerking {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, name: "patient_name" })
  patientName!: string;

  @Column({ type: "varchar", length: 100, name: "patient_id", nullable: true })
  patientId!: string | null;

  @Column({ type: "varchar", length: 50, name: "arrival_source" })
  arrivalSource!: string;

  @Column({ type: "date", name: "date_of_arrival" })
  dateOfArrival!: string;

  @Column({ type: "varchar", length: 10, name: "time_of_arrival" })
  timeOfArrival!: string;

  @Column({ type: "varchar", length: 50 })
  status!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  gender!: string | null;

  @Column({ type: "date", name: "date_of_birth", nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: "varchar", length: 50, name: "recorded_by" })
  recordedBy!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
