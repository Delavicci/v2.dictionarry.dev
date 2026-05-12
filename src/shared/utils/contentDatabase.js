import { contentDatabase } from '@db';

const fallbackDatabaseId = 'dictionarry';

export function getDefaultDatabaseId() {
  return contentDatabase.defaultDatabaseId
    || contentDatabase.databases?.find((database) => database.isDefault)?.id
    || contentDatabase.databases?.[0]?.id
    || fallbackDatabaseId;
}

export function getDatabases() {
  return contentDatabase.databases || [];
}

export function getDatabase(databaseId = getDefaultDatabaseId()) {
  return getDatabases().find((database) => database.id === databaseId) || null;
}

export function getEntriesByType(type, databaseId = getDefaultDatabaseId()) {
  return contentDatabase.entries.filter((entry) => (
    entry.type === type
    && (!entry.databaseId || entry.databaseId === databaseId)
  ));
}

export function getDatabaseEntriesByType(type, databaseId = getDefaultDatabaseId()) {
  return contentDatabase.entries.filter((entry) => (
    entry.type === type
    && entry.databaseId === databaseId
  ));
}

export function getGlobalEntriesByCategory(category) {
  return contentDatabase.entries.filter((entry) => (
    entry.category === category && !entry.databaseId
  ));
}

export function findEntryByTypeAndSlug(type, slug, databaseId = getDefaultDatabaseId()) {
  return contentDatabase.entries.find((entry) => (
    entry.type === type
    && entry.slug === slug
    && (!entry.databaseId || entry.databaseId === databaseId)
  )) || null;
}

export function findEntryByTypeAndName(type, name, databaseId = getDefaultDatabaseId()) {
  return contentDatabase.entries.find((entry) => (
    entry.type === type
    && (entry.data?.name === name || entry.title === name)
    && (!entry.databaseId || entry.databaseId === databaseId)
  )) || null;
}

export function findGlobalEntry(category, slug) {
  return contentDatabase.entries.find((entry) => (
    entry.category === category
    && entry.slug === slug
    && !entry.databaseId
  )) || null;
}

export function getCurrentDatabaseIdFromPath(pathname) {
  const match = pathname.match(/^\/db\/([^/]+)\//);
  return match ? decodeURIComponent(match[1]) : getDefaultDatabaseId();
}

export function stripDatabasePrefix(pathname) {
  return pathname.replace(/^\/db\/[^/]+/, '') || '/';
}

export function getEntrySlugFromPath(pathname, basePath) {
  const cleanPath = stripDatabasePrefix(pathname).replace(/\/$/, '');
  return cleanPath.replace(`/${basePath}/`, '');
}

export function getEntryPath(entry, databaseId = entry?.databaseId) {
  if (!entry) return '/';
  if (!entry.databaseId) return entry.path;
  if (!databaseId || databaseId === getDefaultDatabaseId()) return entry.path;
  return `/db/${encodeURIComponent(databaseId)}${entry.path}`;
}

export function getDatabasePath(path, databaseId = getDefaultDatabaseId()) {
  if (!databaseId || databaseId === getDefaultDatabaseId()) return path;
  return `/db/${encodeURIComponent(databaseId)}${path}`;
}
