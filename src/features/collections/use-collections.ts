"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavedCollection } from "./types";
import {
  loadAllCollections,
  saveCollection,
  deleteCollection,
  deleteAllCollections,
  exportCollectionsJson,
  importCollectionsJson,
  previewCollectionsJson,
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

  const clear = useCallback(async () => {
    await deleteAllCollections();
    setCollections([]);
  }, []);

  const exportJson = useCallback(() => {
    return exportCollectionsJson(collections);
  }, [collections]);

  const importJson = useCallback(async (json: string) => {
    const imported = await importCollectionsJson(json);
    setCollections(await loadAllCollections());
    return imported;
  }, []);

  const previewJson = useCallback((json: string) => {
    return previewCollectionsJson(json);
  }, []);

  return {
    collections,
    loading,
    save,
    remove,
    clear,
    exportJson,
    importJson,
    previewJson,
  };
}
