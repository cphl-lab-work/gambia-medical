# MediLab360 – Medical Dashboard

Next.js app with TypeORM, PostgreSQL, role-based login, and a doctor dashboard. Login works with the database when connected, or with **seed data** when offline.

## Structure

- **`src/helpers`** – roles, local storage, sync helpers
- **`src/database`** – TypeORM data source, entities, migrations
- **`src/seed`** – JSON seed data and seed script (dummy users and dashboard data)
- **`src/app`** – App Router: login, dashboard, API routes

## Roles (seed users)

| Role         | Email                     | Password     |
|-------------|----------------------------|-------------|
| Admin       | admin@medilab360.com        | admin123    |
| Doctor      | doctor@medilab360.com        | doctor123   |
| Nurse       | nurse@medilab360.com         | nurse123    |
| Receptionist| receptionist@medilab360.com  | reception123|
| Accountant  | accountant@medilab360.com    | account123  |
| Pharmacist  | pharmacist@medilab360.com    | pharma123   |
| Lab Tech    | labtech@medilab360.com       | lab123      |

## Setup

1. **Install**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` and set PostgreSQL URL if you use the DB.
   - If you skip the DB, login still works using seed JSON (local fallback).

3. **Database (optional)**
   - Create a Postgres DB (e.g. `createdb hm2`).
   - Run migrations: `npm run db:migrate`
   - Seed users: `npm run db:seed`

4. **Run**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000) → redirects to `/login`.
   - Use any role’s email/password above, or click a role button to fill credentials.
   - **Doctor** sees the full dashboard; other roles see a blank dashboard placeholder.

## Scripts

- `npm run dev` – Next.js dev server
- `npm run build` / `npm run start` – Production
- `npm run db:migrate` – Run TypeORM migrations
- `npm run db:seed` – Seed users from `src/seed/data/users.json` into the DB

## Local vs database

- **Login**: Tries the database first; if it’s down or not configured, it validates against `src/seed/data/users.json` (plain passwords in seed).
- **Dashboard data**: Doctor dashboard loads from `/api/dashboard`, which serves `src/seed/data/dashboard.json` (works without DB).
# gambia-medical
# gambia-medical
