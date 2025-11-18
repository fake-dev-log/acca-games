// frontend/src/utils/parsing.ts

/**
 * Safely parses a value that might be a JSON string or already an object.
 * @param data The data to parse, which can be a string or an object.
 * @returns The parsed object, or null if parsing fails.
 */
export function safeParse(data: string | object): object | null {
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse JSON string:', e);
    return null;
  }
}
