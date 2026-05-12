import { derived, writable } from 'svelte/store';
import { getDatabase, getDatabases, getDefaultDatabaseId } from '@shared/utils/contentDatabase';

const STORAGE_KEY = 'dictionarry-selected-database';

function pathDatabaseId(pathname: string): string | null {
  const match = pathname.match(/^\/db\/([^/]+)(?:\/|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function isValidDatabaseId(databaseId: string | null | undefined): databaseId is string {
  return !!databaseId && getDatabases().some((database) => database.id === databaseId);
}

function loadSelectedDatabaseId(): string {
  if (typeof window !== 'undefined') {
    const pathId = pathDatabaseId(window.location.pathname);
    if (isValidDatabaseId(pathId)) {
      return pathId;
    }

    const savedId = localStorage.getItem(STORAGE_KEY);
    if (isValidDatabaseId(savedId)) {
      return savedId;
    }
  }

  return getDefaultDatabaseId();
}

function saveSelectedDatabaseId(databaseId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, databaseId);
}

function createSelectedDatabaseStore() {
  const { subscribe, set } = writable(loadSelectedDatabaseId());

  function select(databaseId: string) {
    if (!isValidDatabaseId(databaseId)) return;
    set(databaseId);
    saveSelectedDatabaseId(databaseId);
  }

  return {
    subscribe,
    select,
    syncFromPath: (pathname: string) => {
      const databaseId = pathDatabaseId(pathname);
      if (isValidDatabaseId(databaseId)) {
        select(databaseId);
      }
    },
    reset: () => select(getDefaultDatabaseId())
  };
}

export const selectedDatabaseId = createSelectedDatabaseStore();
export const selectedDatabase = derived(selectedDatabaseId, ($selectedDatabaseId) => getDatabase($selectedDatabaseId));
