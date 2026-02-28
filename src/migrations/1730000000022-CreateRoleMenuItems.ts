import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoleMenuItems1730000000022 implements MigrationInterface {
  name = "CreateRoleMenuItems1730000000022";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "role_menu_items" (
        "id"            uuid      NOT NULL DEFAULT gen_random_uuid(),
        "role_id"       uuid      NOT NULL,
        "menu_item_id"  uuid      NOT NULL,
        "can_view"      boolean   NOT NULL DEFAULT true,
        "can_access"    boolean   NOT NULL DEFAULT true,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_role_menu_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_role_menu_item" UNIQUE ("role_id", "menu_item_id"),
        CONSTRAINT "FK_rmi_role"
          FOREIGN KEY ("role_id") REFERENCES "roles"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_rmi_menu_item"
          FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_rmi_role_id"      ON "role_menu_items" ("role_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_rmi_menu_item_id" ON "role_menu_items" ("menu_item_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_rmi_menu_item_id"`);
    await queryRunner.query(`DROP INDEX "IDX_rmi_role_id"`);
    await queryRunner.query(`DROP TABLE "role_menu_items"`);
  }
}
