import { DataSourceConfig, GeneratedDatabaseSource } from './types';

export const DEFAULT_DATABASE_ID = 'dictionarry';
export const DEFAULT_DATABASE_NAME = 'Dictionarry';

export function createGeneratedDatabaseSource(
  config: DataSourceConfig,
  generatedAt: string = new Date().toISOString()
): GeneratedDatabaseSource {
  return {
    id: config.id || DEFAULT_DATABASE_ID,
    name: config.name || DEFAULT_DATABASE_NAME,
    description: config.description,
    repo: config.repo || config.localPath || 'local',
    branch: config.branch || 'main',
    format: config.format || 'yaml',
    isDefault: config.isDefault ?? true,
    generatedAt
  };
}

export function createNamespacedEntryId(databaseId: string | undefined, type: string, slug: string): string {
  if (!databaseId) {
    return `${type}-${slug}`;
  }

  return `${databaseId}:${type}:${slug}`;
}
