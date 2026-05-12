#!/usr/bin/env node

import { parseArgs } from 'util';
import { DataSource } from './contentGeneration/core/DataSource';
import { DatabaseBuilder } from './contentGeneration/core/DatabaseBuilder';
import { DataSourceConfig, ContentEntry, DatabaseFormat, ProcessorConfig } from './contentGeneration/core/types';
import { createGeneratedDatabaseSource } from './contentGeneration/core/databaseSource';
import { databaseSources, getDatabaseSource, getDatabaseSourceGroup } from './contentGeneration/config/databaseSources';

// Import all processors
import { RegexPatternProcessor } from './contentGeneration/processors/RegexPatternProcessor';
import { CustomFormatProcessor } from './contentGeneration/processors/CustomFormatProcessor';
import { QualityProfileProcessor } from './contentGeneration/processors/QualityProfileProcessor';
import { MediaManagementProcessor } from './contentGeneration/processors/MediaManagementProcessor';
import { MarkdownProcessor } from './contentGeneration/processors/MarkdownProcessor';
import { StaticPageProcessor } from './contentGeneration/processors/StaticPageProcessor';
import { RssGenerator } from './contentGeneration/core/RssGenerator';
import { PcdProcessor } from './contentGeneration/pcd/PcdProcessor';

interface CliOptions {
  repo?: string;
  branch?: string;
  localPath?: string;
  source?: string;
  sourceGroup?: string;
  allSources?: boolean;
  databaseId?: string;
  databaseName?: string;
  format?: DatabaseFormat;
  token?: string;
  output?: string;
  cache?: boolean;
  cacheDir?: string;
  verbose?: boolean;
  debug?: boolean;
  only?: string;
  help?: boolean;
}

function showHelp() {
  console.log(`
Content Database Generator

Usage: npm run generate:content -- [options]

Options:
  --repo <url>      GitHub repository URL to fetch content from
  --branch <name>   Branch to use (default: main)
  --local-path <path> Local database path for direct local generation
  --source <id>     Generate from an allowlisted database source
  --source-group <id> Generate from an allowlisted source group
  --all-sources     Generate from all allowlisted sources
  --database-id <id> Stable generated database ID (default: dictionarry)
  --database-name <name> Human-readable generated database name
  --format <format> Source format: yaml or pcd (default: yaml)
  --token <token>   GitHub token for private repositories
  --output <path>   Output path for generated database (default: ./src/generated/contentDatabase.ts)
  --cache           Cache repository for faster subsequent runs
  --cache-dir <dir> Directory for cache storage (default: /tmp/dictionarry-cache)
  --verbose         Show detailed output
  --debug           Enable debug mode with extra logging
  --only <types>    Process only specific content types (comma-separated)
                    Available: regex, custom-formats, quality-profiles, media-management, markdown, static
  --help            Show this help message

Examples:
  # Generate from local files (default)
  npm run generate:content

  # Generate from GitHub repository
  npm run generate:content -- --repo https://github.com/user/repo --branch main

  # Generate from an allowlisted source
  npm run generate:content -- --source dictionarry-dev-yaml

  # Generate only specific types with caching
  npm run generate:content -- --repo https://github.com/user/repo --cache --only regex,custom-formats

  # Use with private repository
  npm run generate:content -- --repo https://github.com/user/private-repo --token ghp_xxxx
`);
}

function createProcessors() {
  return [
    new RegexPatternProcessor(),
    new CustomFormatProcessor(),
    new QualityProfileProcessor(),
    new MediaManagementProcessor(),
    new MarkdownProcessor(),
    new StaticPageProcessor()
  ];
}

function filterProcessors(processors: ReturnType<typeof createProcessors>, only?: string[]) {
  if (!only || only.length === 0) {
    return processors;
  }

  const typeMap: Record<string, string> = {
    'regex': 'regex-pattern',
    'custom-formats': 'custom-format',
    'quality-profiles': 'quality-profile',
    'media-management': 'media-management',
    'markdown': 'markdown',
    'static': 'static'
  };

  const processorNames = only.map(t => typeMap[t] || t);
  return processors.filter(p => processorNames.includes(p.name));
}

function getOnlyTypes(options: CliOptions): string[] | undefined {
  return options.only ? options.only.split(',').map(t => t.trim().toLowerCase()) : undefined;
}

function getOnlyContentTypes(onlyTypes?: string[]): Set<string> | null {
  if (!onlyTypes) {
    return null;
  }

  const typeMap: Record<string, string> = {
    'regex': 'regex-pattern',
    'custom-formats': 'custom-format',
    'quality-profiles': 'quality-profile',
    'media-management': 'media-management',
    'delay-profiles': 'delay-profile',
    'markdown': 'markdown',
    'static': 'static'
  };

  return new Set(onlyTypes.map(type => typeMap[type] || type));
}

function resolveSourceConfigs(options: CliOptions): DataSourceConfig[] {
  const withCliOptions = (source: DataSourceConfig): DataSourceConfig => ({
    ...source,
    token: options.token || source.token,
    cache: options.cache ?? source.cache,
    cacheDir: options.cacheDir
      ? `${options.cacheDir}/${source.id || source.repo || 'source'}`
      : source.cacheDir
  });

  if (options.allSources) {
    return databaseSources.map(withCliOptions);
  }

  if (options.sourceGroup) {
    return getDatabaseSourceGroup(options.sourceGroup).map(withCliOptions);
  }

  if (options.source) {
    return [withCliOptions(getDatabaseSource(options.source))];
  }

  const sourceFormat = options.format || 'yaml';
  if (!['yaml', 'pcd'].includes(sourceFormat)) {
    throw new Error(`Unsupported source format: ${sourceFormat}`);
  }

  return [{
    type: options.repo ? 'github' : 'local',
    id: options.databaseId,
    name: options.databaseName,
    format: sourceFormat,
    repo: options.repo,
    branch: options.branch || 'main',
    token: options.token,
    localPath: options.localPath || './public/database',
    cache: options.cache,
    cacheDir: options.cacheDir || '/tmp/dictionarry-cache'
  }];
}

async function logFileCounts(dataSource: DataSource, verbose?: boolean) {
  if (!verbose) {
    return;
  }

  const fileCounts: Record<string, number> = {
    'regex_patterns': (await dataSource.listFiles('regex_patterns', /\.ya?ml$/)).length,
    'custom_formats': (await dataSource.listFiles('custom_formats', /\.ya?ml$/)).length,
    'profiles': (await dataSource.listFiles('profiles', /\.ya?ml$/)).length,
    'media_management': (await dataSource.listFiles('media_management', /\.ya?ml$/)).length,
    'wiki': (await dataSource.listFiles('wiki', /\.md$/)).length,
    'dev_logs': (await dataSource.listFiles('dev_logs', /\.md$/)).length
  };

  const totalExpectedFiles = Object.values(fileCounts).reduce((sum, count) => sum + count, 0);

  console.log('📂 Repository file counts:');
  for (const [dir, count] of Object.entries(fileCounts)) {
    if (count > 0) {
      console.log(`  • ${dir}: ${count} files`);
    }
  }
  console.log(`  • Total: ${totalExpectedFiles} files`);
}

async function main() {
  try {
    // Parse command line arguments
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        repo: { type: 'string' },
        branch: { type: 'string' },
        'local-path': { type: 'string' },
        source: { type: 'string' },
        'source-group': { type: 'string' },
        'all-sources': { type: 'boolean' },
        'database-id': { type: 'string' },
        'database-name': { type: 'string' },
        format: { type: 'string' },
        token: { type: 'string' },
        output: { type: 'string' },
        cache: { type: 'boolean' },
        'cache-dir': { type: 'string' },
        verbose: { type: 'boolean' },
        debug: { type: 'boolean' },
        only: { type: 'string' },
        help: { type: 'boolean' }
      }
    });

    const options = values as CliOptions & {
      'cache-dir'?: string;
      'database-id'?: string;
      'database-name'?: string;
      'local-path'?: string;
      'source-group'?: string;
      'all-sources'?: boolean;
    };
    options.cacheDir = options['cache-dir'];
    options.databaseId = options['database-id'];
    options.databaseName = options['database-name'];
    options.localPath = options['local-path'];
    options.sourceGroup = options['source-group'];
    options.allSources = options['all-sources'];

    if (options.help) {
      showHelp();
      process.exit(0);
    }

    console.log('🔨 Starting content database generation...');

    const generatedAt = new Date().toISOString();
    const outputPath = options.output || './src/generated/contentDatabase.ts';
    const sourceConfigs = resolveSourceConfigs(options);

    // Initialize processors
    const processors = createProcessors();
    const onlyTypes = getOnlyTypes(options);
    const onlyContentTypes = getOnlyContentTypes(onlyTypes);

    // Filter processors if --only is specified
    let activeProcessors = filterProcessors(processors, onlyTypes);
    if (onlyTypes) {
      console.log(`📦 Processing only: ${onlyTypes.join(', ')}`);
    }

    const globalProcessorNames = new Set(['markdown', 'static']);
    const databaseProcessors = activeProcessors.filter(processor => !globalProcessorNames.has(processor.name));
    const globalProcessors = activeProcessors.filter(processor => globalProcessorNames.has(processor.name));

    // Process all content
    const allEntries: ContentEntry[] = [];
    const errors: Array<{ processor: string; error: string }> = [];
    const databaseSources = sourceConfigs.map(sourceConfig => createGeneratedDatabaseSource(sourceConfig, generatedAt));

    for (const [index, sourceConfig] of sourceConfigs.entries()) {
      const shouldProcessDatabaseSource = sourceConfig.format === 'pcd'
        ? !onlyContentTypes || [...onlyContentTypes].some(type => !globalProcessorNames.has(type))
        : databaseProcessors.length > 0;

      if (!shouldProcessDatabaseSource) {
        continue;
      }

      if (options.verbose) {
        console.log('📋 Configuration:', sourceConfig);
      }

      const dataSource = new DataSource(sourceConfig);
      await dataSource.initialize();

      try {
        await logFileCounts(dataSource, options.verbose);

        const databaseSource = databaseSources[index];
        const processorConfig: ProcessorConfig = {
          source: sourceConfig,
          database: databaseSource,
          outputPath,
          verbose: options.verbose,
          debug: options.debug,
          only: onlyTypes
        };

        if (sourceConfig.format === 'pcd') {
          let entries = await new PcdProcessor().processAll(dataSource, databaseSource, sourceConfig);
          if (onlyContentTypes) {
            entries = entries.filter(entry => onlyContentTypes.has(entry.type));
          }
          allEntries.push(...entries);
          continue;
        }

        for (const processor of databaseProcessors) {
          try {
            if (options.verbose) {
              console.log(`  ⚙️  Processing ${processor.name}...`);
            }

            const entries = await processor.processAll(dataSource, processorConfig);
            allEntries.push(...entries);

            if (options.debug) {
              console.log(`    ✓ Found ${entries.length} ${processor.name} entries`);
            }
          } catch (error: any) {
            const errorMsg = `Failed to process ${processor.name}: ${error.message}`;
            console.error(`    ✗ ${errorMsg}`);
            errors.push({ processor: processor.name, error: error.message });

            if (options.debug) {
              console.error(error.stack);
            }
          }
        }
      } finally {
        await dataSource.cleanup();
      }
    }

    if (globalProcessors.length > 0) {
      const globalSourceConfig: DataSourceConfig = {
        type: 'local',
        localPath: './public'
      };
      const globalDataSource = new DataSource(globalSourceConfig);
      await globalDataSource.initialize();

      try {
        for (const processor of globalProcessors) {
          try {
            const entries = await processor.processAll(globalDataSource, {
              source: globalSourceConfig,
              outputPath,
              verbose: options.verbose,
              debug: options.debug,
              only: onlyTypes
            });
            allEntries.push(...entries);
          } catch (error: any) {
            const errorMsg = `Failed to process ${processor.name}: ${error.message}`;
            console.error(`    ✗ ${errorMsg}`);
            errors.push({ processor: processor.name, error: error.message });
          }
        }
      } finally {
        await globalDataSource.cleanup();
      }
    }

    // Run post-processing
    console.log('🔄 Running post-processing...');
    for (const processor of activeProcessors) {
      if (processor.postProcess) {
        try {
          const processorEntries = allEntries.filter(e => e.type === processor.name || e.category === processor.name);
          await processor.postProcess(processorEntries, allEntries);
        } catch (error: any) {
          console.warn(`  ⚠️  Post-processing failed for ${processor.name}: ${error.message}`);
        }
      }
    }

    // Build database
    console.log('🏗️  Building database...');
    const databaseBuilder = new DatabaseBuilder();
    const database = databaseBuilder.build(allEntries, {
      databases: databaseSources,
      defaultDatabaseId: databaseSources.find(source => source.isDefault)?.id || databaseSources[0]?.id
    });
    
    // Add metadata
    database.metadata = {
      source: databaseSources.map(source => source.repo).join(', '),
      branch: databaseSources.map(source => source.branch).join(', '),
      timestamp: generatedAt,
      entriesCount: allEntries.length
    };

    // Write output
    console.log(`💾 Writing database to ${outputPath}...`);
    await databaseBuilder.write(database, outputPath);

    // Generate RSS feeds
    console.log('📰 Generating RSS feeds...');
    const rssGenerator = new RssGenerator();
    const rssStats = rssGenerator.generate(allEntries);
    console.log(`  • wiki.xml: ${rssStats.wiki} entries`);
    console.log(`  • devlogs.xml: ${rssStats.devlogs} entries`);
    console.log(`  • all.xml: ${rssStats.all} entries`);

    // Display statistics
    const stats = databaseBuilder.getStats(database);
    console.log('\n✅ Content database generated successfully!');
    console.log('📊 Statistics:');
    console.log(`  • Total entries: ${stats.totalEntries}`);
    console.log(`  • By type:`);
    for (const [type, count] of Object.entries(stats.byType)) {
      console.log(`    - ${type}: ${count}`);
    }
    console.log(`  • Categories: ${database.categories.join(', ')}`);
    console.log(`  • Search index: ${stats.searchStats.uniqueTerms} unique terms`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      for (const error of errors) {
        console.log(`  • ${error.processor}: ${error.error}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    if (process.argv.includes('--debug')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as generateContentDatabase };
