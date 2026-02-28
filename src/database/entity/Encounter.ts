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

export type EncounterStatus = "open" | "in_progress" | "completed" | "discharged" | "cancelled";

@Entity("encounters")
export class Encounter {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true, name: "encounter_number", comment: "e.g. ENC-00001" })
  encounterNumber!: string;

  @ManyToOne(() => Patient, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;

  @Column({ type: "varchar", length: 50, name: "arrival_source", nullable: true, comment: "OPD, Emergency, Elective Admission" })
  arrivalSource!: string | null;

  @Column({ type: "uuid", name: "attending_doctor_id", nullable: true, comment: "FK to users" })
  attendingDoctorId!: string | null;

  @Column({ type: "uuid", name: "department_id", nullable: true, comment: "FK to departments" })
  departmentId!: string | null;

  @Column({ type: "varchar", length: 30, default: "'open'" })
  status!: EncounterStatus;

  @Column({ type: "text", name: "chief_complaint", nullable: true, comment: "Chief complaint / presenting complaint" })
  chiefComplaint!: string | null;

  @Column({ type: "text", nullable: true, name: "clinical_notes" })
  clinicalNotes!: string | null;

  @Column({ type: "text", nullable: true })
  diagnosis!: string | null;

  @Column({ type: "text", nullable: true, name: "treatment_plan" })
  treatmentPlan!: string | null;

  @Column({ type: "timestamp", name: "admitted_at", nullable: true })
  admittedAt!: Date | null;

  @Column({ type: "timestamp", name: "discharged_at", nullable: true })
  dischargedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
