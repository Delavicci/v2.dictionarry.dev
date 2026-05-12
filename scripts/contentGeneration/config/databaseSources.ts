import { DataSourceConfig } from '../core/types';

export interface DatabaseSourceDefinition extends DataSourceConfig {
  id: string;
  name: string;
  format: 'yaml' | 'pcd';
  repo: string;
  branch: string;
}

export const databaseSources: DatabaseSourceDefinition[] = [
  {
    id: 'dictionarry',
    name: 'Dictionarry',
    repo: 'https://github.com/Dictionarry-Hub/database',
    branch: 'v2',
    format: 'pcd',
    type: 'github',
    isDefault: true
  },
  {
    id: 'trash-pcd',
    name: 'TRaSH PCD',
    repo: 'https://github.com/Dictionarry-Hub/trash-pcd',
    branch: 'main',
    format: 'pcd',
    type: 'github'
  },
  {
    id: 'dumpstarr',
    name: 'Dumpstarr',
    repo: 'https://github.com/Dumpstarr/Database',
    branch: 'v2',
    format: 'pcd',
    type: 'github'
  },
  {
    id: 'dictionarry-dev-yaml',
    name: 'Dictionarry Dev YAML',
    repo: 'https://github.com/Dictionarry-Hub/database',
    branch: 'dev',
    format: 'yaml',
    type: 'github'
  }
];

export const databaseSourceGroups: Record<string, string[]> = {
  v2: ['dictionarry', 'trash-pcd', 'dumpstarr'],
  legacy: ['dictionarry-dev-yaml'],
  all: databaseSources.map(source => source.id)
};

export function getDatabaseSource(id: string): DatabaseSourceDefinition {
  const source = databaseSources.find(candidate => candidate.id === id);
  if (!source) {
    throw new Error(`Unknown database source: ${id}`);
  }

  return source;
}

export function getDatabaseSourceGroup(id: string): DatabaseSourceDefinition[] {
  const sourceIds = databaseSourceGroups[id];
  if (!sourceIds) {
    throw new Error(`Unknown database source group: ${id}`);
  }

  return sourceIds.map(getDatabaseSource);
}
