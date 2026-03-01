import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePharmacyStock1730000000014 implements MigrationInterface {
  name = "CreatePharmacyStock1730000000014";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pharmacy_stock" (
        "id"                uuid            NOT NULL DEFAULT gen_random_uuid(),
        "drug_name"         varchar(255)    NOT NULL,
        "generic_name"      varchar(100),
        "form"              varchar(50),
        "strength"          varchar(100),
        "quantity_in_stock" integer        NOT NULL DEFAULT 0,
        "reorder_level"     integer        NOT NULL DEFAULT 10,
        "unit"              varchar(50),
        "unit_cost"         decimal(12,2)  NOT NULL DEFAULT 0,
        "selling_price"     decimal(12,2)  NOT NULL DEFAULT 0,
        "batch_number"      varchar(100),
        "expiry_date"       date,
        "supplier"          varchar(255),
        "is_active"         boolean        NOT NULL DEFAULT true,
        "created_at"        TIMESTAMP      NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMP      NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pharmacy_stock_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "pharmacy_stock"`);
  }
}
