import { v4 as uuidv4 } from "uuid";

/**
 * Generate a random UUID v4.
 */
export function generateUuid(): string {
  return uuidv4();
}
