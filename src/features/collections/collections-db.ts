import { del, entries, set } from "idb-keyval";
import { z } from "zod";
import type { SavedCollection } from "./types";
import {
  MAX_COLLECTIONS_PER_IMPORT,
  trimCollectionName,
} from "@/lib/security";
import {
  generateReverseShell,
  reverseShellConfigSchema,
} from "@/lib/reverse-shells";

const KEY = (id: string) => `reverseshell:col:${id}`;

const savedCollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80).transform(trimCollectionName),
  createdAt: z.number().int().nonnegative(),
  config: reverseShellConfigSchema,
  renderedCommand: z.string().max(20_000).optional().default(""),
}).transform((collection) => {
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
  z.object({ collections: savedCollectionsArraySchema }).transform((value) => value.collections),
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

export function exportCollectionsJson(cols: SavedCollection[]): string {
  return JSON.stringify(cols, null, 2);
}

export async function importCollectionsJson(
  json: string,
): Promise<SavedCollection[]> {
  const parsed: unknown = JSON.parse(json);
  const cols = savedCollectionsSchema.parse(parsed);
  const existingIds = new Set((await loadAllCollections()).map((col) => col.id));

  for (const col of cols) {
    const id = existingIds.has(col.id) ? crypto.randomUUID() : col.id;
    existingIds.add(id);
    await saveCollection({ ...col, id });
  }
  return cols;
}
