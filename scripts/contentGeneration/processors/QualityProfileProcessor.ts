import * as path from 'path';
import * as yaml from 'js-yaml';
import { ContentEntry, RawContent, ProcessorConfig, ContentProcessor } from '../core/types';
import { DataSource } from '../core/DataSource';
import { createNamespacedEntryId } from '../core/databaseSource';
import { slugify, sanitizeForSearch } from '../utils/text';

export class QualityProfileProcessor extends ContentProcessor {
  name = 'quality-profile';
  supportedPaths = ['profiles'];

  canProcess(path: string): boolean {
    return path.includes('profiles') && (path.endsWith('.yml') || path.endsWith('.yaml'));
  }

  async process(content: RawContent, config: ProcessorConfig): Promise<ContentEntry | null> {
    try {
      const data = yaml.load(content.content) as any;
      const filename = path.basename(content.path);
      const slug = slugify(filename.replace(/\.ya?ml$/, ''));
      
      const title = data.name || filename.replace(/\.ya?ml$/, '').replace(/[-_]/g, ' ');
      const description = data.description || '';
      const tags = [...(data.tags || []), 'quality-profile'];
      
      const searchContent = `${title} ${description} quality profile ${JSON.stringify(data.formatItems || [])}`;
      
      return {
        id: createNamespacedEntryId(config.database?.id, 'quality-profile', slug),
        databaseId: config.database?.id,
        sourceEntityId: data.name || slug,
        path: `/quality-profile/${slug}`,
        type: 'quality-profile',
        slug,
        category: 'quality-profile',
        title,
        description,
        data,
        searchText: sanitizeForSearch(searchContent),
        searchWeight: 0.9,
        tags,
        filename,
        lastModified: content.stats?.mtime || new Date().toISOString()
      };
    } catch (error: any) {
      console.warn(`Error processing quality profile ${content.path}:`, error.message);
      return null;
    }
  }

  async processAll(source: DataSource, config: ProcessorConfig): Promise<ContentEntry[]> {
    const entries: ContentEntry[] = [];
    const files = await source.listFiles('profiles', /\.ya?ml$/);
    
    // Batch fetch commit logs for all files (get all commits)
    const commitLogs = await source.getFileCommitLogs(files);
    
    for (const file of files) {
      const content = await source.readFile(file);
      if (content) {
        const entry = await this.process(content, config);
        if (entry) {
          // Add commit log if available
          const commitLog = commitLogs.get(file);
          if (commitLog) {
            entry.commitLog = commitLog;
          }
          entries.push(entry);
        }
      }
    }
    
    return entries;
  }

  // Link custom formats to quality profiles
  async postProcess(entries: ContentEntry[], allEntries: ContentEntry[]): Promise<void> {
    const customFormats = allEntries.filter(entry => entry.type === 'custom-format');

    for (const entry of entries) {
      if (entry.type === 'quality-profile') {
        const customFormatMap = new Map(
          customFormats
            .filter(format => format.databaseId === entry.databaseId)
            .map(format => [format.slug, format])
        );

        // Process generic custom_formats field
        if (entry.data?.custom_formats) {
          entry.data.custom_formats = this.enrichCustomFormats(entry.data.custom_formats, customFormatMap);
        }
        
        // Process Radarr-specific custom formats
        if (entry.data?.custom_formats_radarr) {
          entry.data.custom_formats_radarr = this.enrichCustomFormats(entry.data.custom_formats_radarr, customFormatMap);
        }
        
        // Process Sonarr-specific custom formats
        if (entry.data?.custom_formats_sonarr) {
          entry.data.custom_formats_sonarr = this.enrichCustomFormats(entry.data.custom_formats_sonarr, customFormatMap);
        }
      }
    }
  }

  private enrichCustomFormats(formats: any[], customFormatMap: Map<string, ContentEntry>): any[] {
    return formats.map((cf: any) => {
      if (!cf.name) return cf;
      const cfSlug = slugify(cf.name);
      const customFormatEntry = customFormatMap.get(cfSlug);
      if (customFormatEntry) {
        return {
          ...cf,
          slug: cfSlug,
          tags: customFormatEntry.data.tags || [],
          conditions: customFormatEntry.data.conditions || [],
          description: customFormatEntry.data.description || ''
        };
      }
      return cf;
    });
  }
}
