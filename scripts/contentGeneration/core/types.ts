export interface CommitInfo {
  hash: string;
  date: string;
  authors: string[];
  message: string;
}

export interface CommitLog {
  commits: CommitInfo[];
  totalCommits: number;
  firstCommit?: { date: string; hash: string };
  lastCommit?: { date: string; hash: string };
  repoUrl?: string;
  branch?: string;
  filePath?: string;
}

export type DatabaseFormat = 'yaml' | 'pcd';

export interface GeneratedDatabaseSource {
  id: string;
  name: string;
  description?: string;
  version?: string;
  repo: string;
  branch: string;
  format: DatabaseFormat;
  arrTypes?: string[];
  isDefault?: boolean;
  generatedAt: string;
}

export interface ContentEntry {
  id: string;
  databaseId?: string;
  sourceEntityId?: string;
  path: string;
  type: 'quality-profile' | 'custom-format' | 'regex-pattern' | 'media-management' | 'delay-profile' | 'markdown' | 'static';
  slug: string;
  category: string;
  
  title: string;
  description?: string;
  data?: any;
  frontmatter?: any;
  blocks?: any[];
  markdown?: string;
  
  navigation?: (string | NavigationItem)[];
  
  searchText: string;
  searchWeight: number;
  tags: string[];
  
  filename?: string;
  lastModified?: string;
  commitLog?: CommitLog;
}

export interface NavigationItem {
  title?: string;
  children?: (string | NavigationItem)[];
  level?: number;
}

export interface ContentDatabase {
  entries: ContentEntry[];
  routeMap: Record<string, ContentEntry>;
  databases: GeneratedDatabaseSource[];
  defaultDatabaseId: string;
  searchIndex: {
    terms: Record<string, string[]>;
    entries: Record<string, {
      title: string;
      description: string;
      route: string;
      type: string;
      weight: number;
    }>;
  };
  categories: string[];
  lastGenerated: string;
  version: string;
  metadata?: {
    source: string;
    branch: string;
    timestamp: string;
    entriesCount: number;
  };
}

export interface DataSourceConfig {
  type: 'local' | 'github';
  id?: string;
  name?: string;
  format?: DatabaseFormat;
  description?: string;
  isDefault?: boolean;
  repo?: string;
  branch?: string;
  token?: string;
  localPath?: string;
  cache?: boolean;
  cacheDir?: string;
  verbose?: boolean;
}

export interface ProcessorConfig {
  source: DataSourceConfig;
  database?: GeneratedDatabaseSource;
  outputPath: string;
  verbose?: boolean;
  debug?: boolean;
  only?: string[];
}

export interface RawContent {
  path: string;
  content: string;
  stats?: {
    size: number;
    mtime: string;
  };
}

export interface ProcessorResult {
  entries: ContentEntry[];
  errors: ProcessorError[];
  warnings: string[];
}

export interface ProcessorError {
  processor: string;
  file: string;
  error: string;
  stack?: string;
}

export abstract class ContentProcessor {
  abstract name: string;
  abstract supportedPaths: string[];
  
  abstract canProcess(path: string): boolean;
  abstract process(content: RawContent, config: ProcessorConfig): Promise<ContentEntry | null>;
  
  async postProcess?(entries: ContentEntry[], allEntries: ContentEntry[]): Promise<void>;
}
