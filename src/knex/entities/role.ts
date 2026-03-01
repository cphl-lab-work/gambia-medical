import { Knex } from 'knex';

export interface Role {
  id: string;
  name: string;
  code: string | null;
  display_name: string | null;
  description: string | null;
  permissions: string | null;
  is_system_role: boolean;
  status: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function getAllRoles(knex: Knex): Promise<Role[]> {
  return knex<Role>('roles').select('*');
}

export async function getRoleById(knex: Knex, id: string): Promise<Role | undefined> {
  return knex<Role>('roles').where({ id }).first();
}
