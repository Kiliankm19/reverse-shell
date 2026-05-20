"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavedCollection } from "./types";
import {
  loadAllCollections,
  saveCollection,
  deleteCollection,
  exportCollectionsJson,
  importCollectionsJson,
} from "./collections-db";

export function useCollections() {
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllCollections()
      .then(setCollections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (col: SavedCollection) => {
    await saveCollection(col);
    setCollections(await loadAllCollections());
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const exportJson = useCallback(() => {
    return exportCollectionsJson(collections);
  }, [collections]);

  const importJson = useCallback(async (json: string) => {
    const imported = await importCollectionsJson(json);
    setCollections(await loadAllCollections());
    return imported;
  }, []);

  return { collections, loading, save, remove, exportJson, importJson };
}
