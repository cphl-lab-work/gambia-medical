import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

export type FacilityTeamStatus = "active" | "inactive" | "on_leave" | "suspended";

@Entity("facility_team")
export class FacilityTeam {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "staff_id", comment: "Reference to User (staff)" })
  staffId!: string;

  @Column({ type: "uuid", name: "facility_id", comment: "Reference to Facility" })
  facilityId!: string;

  @Column({ type: "varchar", length: 50, default: "active", comment: "Status: active, inactive, on_leave, suspended" })
  status!: FacilityTeamStatus;

  @Column({ type: "text", nullable: true, comment: "Additional details about the team member" })
  details!: string | null;

  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
