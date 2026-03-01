import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "role_menu_items" (
      "id"           uuid      NOT NULL DEFAULT gen_random_uuid(),
      "role_id"      uuid      NOT NULL,
      "menu_item_id" uuid      NOT NULL,
      "can_view"     boolean   NOT NULL DEFAULT true,
      "can_access"   boolean   NOT NULL DEFAULT true,
      "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_role_menu_items_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_role_menu_item"     UNIQUE ("role_id", "menu_item_id"),
      CONSTRAINT "FK_rmi_role"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "FK_rmi_menu_item"
        FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_rmi_role_id"      ON "role_menu_items" ("role_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_rmi_menu_item_id" ON "role_menu_items" ("menu_item_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_rmi_menu_item_id"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_rmi_role_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "role_menu_items"`);
}
