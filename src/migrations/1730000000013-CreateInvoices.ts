import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvoices1730000000013 implements MigrationInterface {
  name = "CreateInvoices1730000000013";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id"                  uuid            NOT NULL DEFAULT gen_random_uuid(),
        "invoice_number"      varchar(50)     NOT NULL,
        "patient_id"          uuid            NOT NULL,
        "encounter_id"        uuid,
        "total_amount"        decimal(12,2)   NOT NULL DEFAULT 0,
        "paid_amount"         decimal(12,2)   NOT NULL DEFAULT 0,
        "discount"            decimal(12,2)   NOT NULL DEFAULT 0,
        "status"              varchar(30)     NOT NULL DEFAULT 'draft',
        "payment_method"      varchar(50),
        "insurance_claim_ref" varchar(255),
        "notes"               text,
        "created_by"          uuid,
        "created_at"          TIMESTAMP       NOT NULL DEFAULT now(),
        "updated_at"          TIMESTAMP       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoices_id"     PRIMARY KEY ("id"),
        CONSTRAINT "UQ_invoices_number" UNIQUE ("invoice_number"),
        CONSTRAINT "FK_invoices_patient"
          FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_invoices_encounter"
          FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id")
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "FK_invoices_created_by"
          FOREIGN KEY ("created_by") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_invoices_patient_id" ON "invoices" ("patient_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_status"     ON "invoices" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "invoice_items" (
        "id"          uuid            NOT NULL DEFAULT gen_random_uuid(),
        "invoice_id"  uuid            NOT NULL,
        "description" varchar(255)    NOT NULL,
        "category"    varchar(50),
        "quantity"    integer         NOT NULL DEFAULT 1,
        "unit_price"  decimal(12,2)   NOT NULL DEFAULT 0,
        "amount"      decimal(12,2)   NOT NULL DEFAULT 0,
        "created_at"  TIMESTAMP       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoice_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoice_items_invoice"
          FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_invoice_items_invoice_id" ON "invoice_items" ("invoice_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_invoice_items_invoice_id"`);
    await queryRunner.query(`DROP TABLE "invoice_items"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_status"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_patient_id"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
  }
}
