import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMenuItems1730000000006 implements MigrationInterface {
  name = "CreateMenuItems1730000000006";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menu_items" (
        "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
        "menu_precision"  varchar(50),
        "name"            varchar(100) NOT NULL,
        "icon"            varchar(50),
        "path"            varchar(255),
        "menu_type"       varchar(50),
        "parent_id"       uuid,
        "med_permissions"  text,
        "sort_order"      integer     NOT NULL DEFAULT 0,
        "is_active"       boolean     NOT NULL DEFAULT true,
        "created_at"      TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_items_parent_id"
          FOREIGN KEY ("parent_id") REFERENCES "menu_items"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_menu_items_parent_id" ON "menu_items" ("parent_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_menu_items_sort_order" ON "menu_items" ("sort_order")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_sort_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_parent_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_items"`);
  }
}
