import { del, entries, set } from "idb-keyval";
import { z } from "zod";
import type { SavedCollection } from "./types";
import {
  MAX_COLLECTION_IMPORT_BYTES,
  MAX_COLLECTIONS_PER_IMPORT,
  assertWithinTextLimit,
  trimCollectionName,
} from "@/lib/security";
import {
  generateReverseShell,
  reverseShellConfigSchema,
} from "@/lib/reverse-shells";

export const COLLECTIONS_SCHEMA_VERSION = 1;

const KEY = (id: string) => `reverseshell:col:${id}`;

export type CollectionsImportResult = {
  imported: number;
  skippedDuplicates: number;
};

const savedCollectionSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(80).transform(trimCollectionName),
    createdAt: z.number().int().nonnegative(),
    config: reverseShellConfigSchema,
    renderedCommand: z.string().max(20_000).optional().default(""),
  })
  .transform((collection) => {
    const renderedCommand = generateReverseShell(collection.config).command;
    return {
      ...collection,
      renderedCommand,
    };
  });

const savedCollectionsArraySchema = z
  .array(savedCollectionSchema)
  .max(MAX_COLLECTIONS_PER_IMPORT);
const savedCollectionsSchema = z.union([
  savedCollectionsArraySchema,
  z
    .object({ collections: savedCollectionsArraySchema })
    .transform((value) => value.collections),
]);

export async function saveCollection(col: SavedCollection): Promise<void> {
  const safeCollection = savedCollectionSchema.parse(col);
  await set(KEY(safeCollection.id), safeCollection);
}

export async function loadAllCollections(): Promise<SavedCollection[]> {
  const all = await entries<string, SavedCollection>();
  return all
    .filter(
      ([key]) => typeof key === "string" && key.startsWith("reverseshell:col:"),
    )
    .map(([, value]) => savedCollectionSchema.safeParse(value))
    .filter(
      (result): result is z.SafeParseSuccess<SavedCollection> => result.success,
    )
    .map((result) => result.data)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteCollection(id: string): Promise<void> {
  await del(KEY(id));
}

export async function deleteAllCollections(): Promise<void> {
  const all = await entries<string, SavedCollection>();
  await Promise.all(
    all
      .filter(
        ([key]) =>
          typeof key === "string" && key.startsWith("reverseshell:col:"),
      )
      .map(([key]) => del(key)),
  );
}

export function exportCollectionsJson(cols: SavedCollection[]): string {
  return JSON.stringify(
    { schemaVersion: COLLECTIONS_SCHEMA_VERSION, collections: cols },
    null,
    2,
  );
}

export async function renameCollection(
  id: string,
  name: string,
): Promise<void> {
  const all = await loadAllCollections();
  const found = all.find((col) => col.id === id);
  if (!found) return;
  await saveCollection({ ...found, name });
}

export function previewCollectionsJson(json: string): SavedCollection[] {
  const parsed: unknown = JSON.parse(json);
  return savedCollectionsSchema.parse(parsed);
}

export async function importCollectionsJson(
  json: string,
): Promise<CollectionsImportResult> {
  assertWithinTextLimit(json, MAX_COLLECTION_IMPORT_BYTES, "Import file");
  const cols = previewCollectionsJson(json);
  const existingIds = new Set(
    (await loadAllCollections()).map((col) => col.id),
  );
  let skippedDuplicates = 0;

  for (const col of cols) {
    const duplicate = existingIds.has(col.id);
    const id = duplicate ? crypto.randomUUID() : col.id;
    if (duplicate) skippedDuplicates += 1;
    existingIds.add(id);
    await saveCollection({ ...col, id });
  }
  return { imported: cols.length, skippedDuplicates };
}
