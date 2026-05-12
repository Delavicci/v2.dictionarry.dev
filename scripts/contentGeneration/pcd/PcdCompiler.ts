import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { DataSource } from '../core/DataSource';
import { DataSourceConfig } from '../core/types';

export interface PcdManifest {
  name: string;
  version?: string;
  description?: string;
  arr_types?: string[];
  dependencies?: Record<string, string>;
  repository?: string;
  profilarr?: {
    minimum_version?: string;
  };
}

export interface CompiledPcd {
  dbPath: string;
  manifest: PcdManifest;
  cleanup: () => void;
  queryAll: <T = Record<string, any>>(sql: string) => T[];
}

interface SqlOp {
  layer: 'schema' | 'base';
  file: string;
  sql: string;
}

const unsafeSqlPatterns = [
  { pattern: /^\s*\./m, label: 'sqlite dot commands' },
  { pattern: /\bATTACH\b/i, label: 'ATTACH' },
  { pattern: /\bDETACH\b/i, label: 'DETACH' },
  { pattern: /\bVACUUM\s+INTO\b/i, label: 'VACUUM INTO' },
  { pattern: /\bload_extension\s*\(/i, label: 'load_extension' }
];

function sortOpPaths(a: string, b: string): number {
  return path.basename(a).localeCompare(path.basename(b), undefined, {
    numeric: true,
    sensitivity: 'base'
  });
}

function assertSafeSql(sql: string, file: string, layer: SqlOp['layer']) {
  for (const { pattern, label } of unsafeSqlPatterns) {
    if (pattern.test(sql)) {
      throw new Error(`Unsafe SQL rejected in ${file}: ${label}`);
    }
  }

  if (layer === 'base' && /(^|;)\s*(CREATE|ALTER|DROP)\b/i.test(sql)) {
    throw new Error(`Unsafe SQL rejected in ${file}: base ops cannot contain DDL`);
  }
}

function runSql(dbPath: string, op: SqlOp) {
  assertSafeSql(op.sql, op.file, op.layer);

  const result = spawnSync('sqlite3', [dbPath], {
    input: `PRAGMA foreign_keys = ON;\n${op.sql}\n`,
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 20
  });

  if (result.error) {
    throw new Error(`sqlite3 failed for ${op.layer}:${op.file}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`SQLite compile failed in ${op.layer}:${op.file}: ${result.stderr || result.stdout}`);
  }
}

function queryAll<T = Record<string, any>>(dbPath: string, sql: string): T[] {
  const result = spawnSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 20
  });

  if (result.error) {
    throw new Error(`sqlite3 query failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`SQLite query failed: ${result.stderr || result.stdout}`);
  }

  if (!result.stdout.trim()) {
    return [];
  }

  return JSON.parse(result.stdout) as T[];
}

function normalizeSchemaDependency(manifest: PcdManifest): { repo: string; version: string } {
  const dependencies = manifest.dependencies || {};
  const entry = Object.entries(dependencies).find(([name]) => (
    name === 'schema'
    || name.endsWith('/schema')
    || name.endsWith('/schema.git')
  ));

  if (!entry) {
    throw new Error('PCD manifest is missing a schema dependency');
  }

  const [name, version] = entry;
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Schema dependency must be an exact version, received: ${version}`);
  }

  const repo = name === 'schema' ? 'https://github.com/Dictionarry-Hub/schema' : name;
  return { repo, version };
}

async function readOps(source: DataSource, layer: SqlOp['layer']): Promise<SqlOp[]> {
  const files = (await source.listFiles('ops', /\.sql$/)).sort(sortOpPaths);
  const ops: SqlOp[] = [];

  for (const file of files) {
    const content = await source.readFile(file);
    if (content) {
      ops.push({ layer, file, sql: content.content });
    }
  }

  return ops;
}

async function cloneSchemaSource(schemaRepo: string, version: string, sourceConfig: DataSourceConfig): Promise<DataSource> {
  if (process.env.PCD_SCHEMA_PATH) {
    const schemaSource = new DataSource({
      type: 'local',
      localPath: process.env.PCD_SCHEMA_PATH
    });
    await schemaSource.initialize();
    return schemaSource;
  }

  const tagCandidates = [version, `v${version}`];
  let lastError: any = null;

  for (const tag of tagCandidates) {
    const schemaSource = new DataSource({
      type: 'github',
      repo: schemaRepo,
      branch: tag,
      token: sourceConfig.token,
      cache: sourceConfig.cache,
      cacheDir: sourceConfig.cacheDir ? `${sourceConfig.cacheDir}/schema-${tag}` : undefined
    });

    try {
      await schemaSource.initialize();
      return schemaSource;
    } catch (error: any) {
      lastError = error;
      await schemaSource.cleanup();
    }
  }

  throw new Error(`Could not resolve schema ${schemaRepo} at ${version}: ${lastError?.message || 'unknown error'}`);
}

export class PcdCompiler {
  async compile(source: DataSource, sourceConfig: DataSourceConfig): Promise<CompiledPcd> {
    const manifestContent = await source.readFile('pcd.json');
    if (!manifestContent) {
      throw new Error('PCD source is missing pcd.json');
    }

    const manifest = JSON.parse(manifestContent.content) as PcdManifest;
    const schemaDependency = normalizeSchemaDependency(manifest);
    const schemaSource = await cloneSchemaSource(schemaDependency.repo, schemaDependency.version, sourceConfig);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dictionarry-pcd-'));
    const dbPath = path.join(tempDir, 'compiled.sqlite');

    try {
      const schemaOps = await readOps(schemaSource, 'schema');
      const baseOps = await readOps(source, 'base');
      const ops = [...schemaOps, ...baseOps];

      for (const op of ops) {
        runSql(dbPath, op);
      }

      return {
        dbPath,
        manifest,
        queryAll: <T = Record<string, any>>(sql: string) => queryAll<T>(dbPath, sql),
        cleanup: () => {
          schemaSource.cleanup();
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      };
    } catch (error) {
      await schemaSource.cleanup();
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw error;
    }
  }
}
