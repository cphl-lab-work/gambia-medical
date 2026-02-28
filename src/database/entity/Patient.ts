import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("patients")
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true, comment: "Unique patient ID / UHID" })
  uhid!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "integer", nullable: true })
  age!: number | null;

  @Column({ type: "date", name: "date_of_birth", nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  gender!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "text", nullable: true })
  address!: string | null;

  @Column({ type: "varchar", length: 10, name: "country_code", nullable: true })
  countryCode!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  district!: string | null;

  @Column({ type: "varchar", length: 255, name: "next_of_kin", nullable: true })
  nextOfKin!: string | null;

  @Column({ type: "varchar", length: 50, name: "next_of_kin_phone", nullable: true })
  nextOfKinPhone!: string | null;

  @Column({ type: "varchar", length: 50, name: "next_of_kin_relationship", nullable: true })
  nextOfKinRelationship!: string | null;

  @Column({ type: "varchar", length: 50, name: "insurance_type", default: "'self-pay'" })
  insuranceType!: string;

  @Column({ type: "varchar", length: 255, name: "insurance_policy", nullable: true })
  insurancePolicy!: string | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
