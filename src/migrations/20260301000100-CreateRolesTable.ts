import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRolesTable20260301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "roles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "name",
            type: "varchar",
            length: "50",
            isUnique: true,
          },
          {
            name: "code",
            type: "varchar",
            length: "20",
            isUnique: true,
            isNullable: true,
            comment: "Uppercase short code e.g. ADMIN, DOCTOR",
          },
          {
            name: "display_name",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "permissions",
            type: "text",
            isNullable: true,
            comment: "JSON array of permission strings",
          },
          {
            name: "is_system_role",
            type: "boolean",
            default: false,
            comment: "System roles cannot be deleted",
          },
          {
            name: "status",
            type: "varchar",
            length: "20",
            default: "'active'",
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("roles");
  }
}
