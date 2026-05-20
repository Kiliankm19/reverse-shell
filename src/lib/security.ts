export const MAX_COMMAND_CHARS = 20_000;
export const MAX_COLLECTION_IMPORT_BYTES = 1_000_000;
export const MAX_COLLECTIONS_PER_IMPORT = 100;
export const MAX_COLLECTION_NAME_LENGTH = 80;

export function assertWithinTextLimit(
  value: string,
  maxChars: number,
  label: string,
): void {
  if (value.length > maxChars) {
    throw new Error(
      `${label} is too large. Maximum size is ${maxChars} characters.`,
    );
  }
}

export function trimCollectionName(value: string): string {
  return value.trim().slice(0, MAX_COLLECTION_NAME_LENGTH);
}
