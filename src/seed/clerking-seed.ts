import type { ClerkingRecord } from "@/helpers/local-storage";

export const TARGET_SEED_RECORDS = 200;

const SAMPLE_FIRST_NAMES = [
  "James", "Mary", "Peter", "Grace", "David", "Sarah", "John", "Elizabeth", "Michael", "Ruth",
  "Joseph", "Helen", "Charles", "Anna", "Daniel", "Florence", "Paul", "Joyce", "Mark", "Catherine",
  "Stephen", "Margaret", "Andrew", "Rose", "Joshua", "Christine", "Samuel", "Jane", "Isaac", "Nancy",
  "Simon", "Dorothy", "Thomas", "Agnes", "Patrick", "Susan", "George", "Kenneth", "Lucy",
];
const SAMPLE_LAST_NAMES = [
  "Okello", "Akinyi", "Ochieng", "Mwangi", "Kamau", "Odhiambo", "Kipchoge", "Wambui", "Korir", "Njeri",
  "Otieno", "Achieng", "Omondi", "Adhiambo", "Kibet", "Wanjiku", "Chebet", "Nyambura", "Kiplagat", "Wanjiru",
  "Mutua", "Muthoni", "Njuguna", "Kariuki", "Nyokabi", "Maina", "Wangeci", "Ngugi", "Wambu",
];

export function generateSeedRecords(count: number, baseRecords: ClerkingRecord[]): ClerkingRecord[] {
  const year = new Date().getFullYear();
  const sources = ["OPD", "Emergency Department", "Elective Admission"] as const;
  const statuses = ["Pending assessment", "Assessed", "Admitted"] as const;
  const recordedBy = ["receptionist", "nurse"];
  const out = [...baseRecords];
  let opdCounter = baseRecords.filter((r) => r.patientId?.startsWith(`OPD-${year}-`)).length;
  for (let i = out.length; i < count; i++) {
    const firstName = SAMPLE_FIRST_NAMES[i % SAMPLE_FIRST_NAMES.length];
    const lastName = SAMPLE_LAST_NAMES[Math.floor(i / SAMPLE_FIRST_NAMES.length) % SAMPLE_LAST_NAMES.length];
    opdCounter += 1;
    const patientId = `OPD-${year}-${String(opdCounter).padStart(4, "0")}`;
    const daysAgo = Math.floor(Math.random() * 60);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateOfArrival = d.toISOString().slice(0, 10);
    const hour = 6 + Math.floor(Math.random() * 12);
    const min = Math.floor(Math.random() * 60);
    const timeOfArrival = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const createdAt = new Date(d.getTime() + 5 * 60000).toISOString();
    out.push({
      id: `clerk-gen-${i}`,
      patientName: `${firstName} ${lastName}`,
      patientId,
      arrivalSource: sources[Math.floor(Math.random() * sources.length)],
      dateOfArrival,
      timeOfArrival,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      phone: Math.random() > 0.3 ? `+2567${String(10000000 + i).slice(-7)}` : null,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      dateOfBirth: null,
      nationality: null,
      district: null,
      country: null,
      address: null,
      email: null,
      recordedBy: recordedBy[Math.floor(Math.random() * recordedBy.length)],
      createdAt,
    });
  }
  return out;
}
