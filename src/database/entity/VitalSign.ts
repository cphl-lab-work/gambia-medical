import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Encounter } from "./Encounter";

@Entity("vital_signs")
export class VitalSign {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Encounter, { onDelete: "CASCADE" })
  @JoinColumn({ name: "encounter_id" })
  encounter!: Encounter;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true, comment: "kg" })
  weight!: string | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true, comment: "cm" })
  height!: string | null;

  @Column({ type: "decimal", precision: 4, scale: 1, nullable: true, name: "temperature", comment: "°C" })
  temperature!: string | null;

  @Column({ type: "integer", nullable: true, name: "bp_systolic" })
  bpSystolic!: number | null;

  @Column({ type: "integer", nullable: true, name: "bp_diastolic" })
  bpDiastolic!: number | null;

  @Column({ type: "integer", nullable: true, comment: "bpm" })
  pulse!: number | null;

  @Column({ type: "integer", nullable: true, name: "respiratory_rate", comment: "breaths/min" })
  respiratoryRate!: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true, name: "spo2", comment: "%" })
  spo2!: string | null;

  @Column({ type: "integer", nullable: true, name: "pain_score", comment: "0-10" })
  painScore!: number | null;

  @Column({ type: "varchar", length: 20, nullable: true, name: "triage_category", comment: "Green, Yellow, Orange, Red" })
  triageCategory!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "uuid", name: "recorded_by", nullable: true, comment: "FK to users" })
  recordedBy!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
