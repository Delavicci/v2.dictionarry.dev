import { ContentEntry, GeneratedDatabaseSource } from '../core/types';
import { createNamespacedEntryId } from '../core/databaseSource';
import { slugify, sanitizeForSearch } from '../utils/text';
import { PcdRows } from './PcdReader';

function entryBase(
  database: GeneratedDatabaseSource,
  type: ContentEntry['type'],
  slug: string,
  title: string,
  description: string,
  path: string,
  data: any,
  tags: string[],
  searchWeight: number
): ContentEntry {
  return {
    id: createNamespacedEntryId(database.id, type, slug),
    databaseId: database.id,
    sourceEntityId: data.name || slug,
    path,
    type,
    slug,
    category: type,
    title,
    description,
    data,
    searchText: sanitizeForSearch(`${title} ${description} ${tags.join(' ')} ${JSON.stringify(data)}`),
    searchWeight,
    tags,
    lastModified: database.generatedAt
  };
}

function mediaSubtypeLabel(subtype: string): string {
  const labels: Record<string, string> = {
    'naming': 'Naming',
    'media-settings': 'Media Settings',
    'quality-definitions': 'Quality Definitions'
  };

  return labels[subtype] || subtype;
}

function arrLabel(arrType: string): string {
  return arrType === 'radarr' ? 'Radarr' : arrType === 'sonarr' ? 'Sonarr' : arrType;
}

export class PcdContentMapper {
  map(rows: PcdRows, database: GeneratedDatabaseSource): ContentEntry[] {
    const entries: ContentEntry[] = [
      ...this.mapRegularExpressions(rows, database),
      ...this.mapCustomFormats(rows, database),
      ...this.mapQualityProfiles(rows, database),
      ...this.mapDelayProfiles(rows, database),
      ...this.mapMediaManagement(rows, database)
    ];

    this.addCustomFormatReferences(entries);
    this.addRegexReferences(entries);

    return entries;
  }

  private mapRegularExpressions(rows: PcdRows, database: GeneratedDatabaseSource): ContentEntry[] {
    return rows.regularExpressions.map((regex) => {
      const slug = slugify(regex.name);
      const data = {
        name: regex.name,
        pattern: regex.pattern,
        description: regex.description || '',
        regex101_id: regex.regex101_id,
        tags: regex.tags || []
      };

      return entryBase(
        database,
        'regex-pattern',
        slug,
        regex.name,
        regex.description || '',
        `/regex-pattern/${slug}`,
        data,
        [...(regex.tags || []), 'regex'],
        0.8
      );
    });
  }

  private mapCustomFormats(rows: PcdRows, database: GeneratedDatabaseSource): ContentEntry[] {
    return rows.customFormats.map((format) => {
      const slug = slugify(format.name);
      const data = {
        name: format.name,
        description: format.description || '',
        include_in_rename: format.include_in_rename,
        tags: format.tags || [],
        conditions: format.conditions || [],
        tests: format.tests || []
      };

      return entryBase(
        database,
        'custom-format',
        slug,
        format.name,
        format.description || '',
        `/custom-format/${slug}`,
        data,
        [...(format.tags || []), 'custom-format'],
        0.9
      );
    });
  }

  private mapQualityProfiles(rows: PcdRows, database: GeneratedDatabaseSource): ContentEntry[] {
    return rows.qualityProfiles.map((profile) => {
      const slug = slugify(profile.name);
      const data = {
        name: profile.name,
        description: profile.description || '',
        tags: profile.tags || [],
        languages: profile.languages || [],
        upgradesAllowed: profile.upgradesAllowed,
        minCustomFormatScore: profile.minCustomFormatScore,
        upgradeUntilScore: profile.upgradeUntilScore,
        minScoreIncrement: profile.minScoreIncrement,
        custom_formats: profile.custom_formats || [],
        custom_formats_radarr: profile.custom_formats_radarr || [],
        custom_formats_sonarr: profile.custom_formats_sonarr || [],
        qualities: profile.qualities || [],
        upgrade_until: profile.upgrade_until
      };

      return entryBase(
        database,
        'quality-profile',
        slug,
        profile.name,
        profile.description || '',
        `/quality-profile/${slug}`,
        data,
        [...(profile.tags || []), 'quality-profile'],
        0.9
      );
    });
  }

  private mapDelayProfiles(rows: PcdRows, database: GeneratedDatabaseSource): ContentEntry[] {
    return rows.delayProfiles.map((profile) => {
      const slug = slugify(profile.name);
      const data = {
        name: profile.name,
        preferred_protocol: profile.preferred_protocol,
        usenet_delay: profile.usenet_delay,
        torrent_delay: profile.torrent_delay,
        bypass_if_highest_quality: profile.bypass_if_highest_quality,
        bypass_if_above_custom_format_score: profile.bypass_if_above_custom_format_score,
        minimum_custom_format_score: profile.minimum_custom_format_score
      };

      return entryBase(
        database,
        'delay-profile',
        slug,
        profile.name,
        '',
        `/delay-profile/${slug}`,
        data,
        ['delay-profile'],
        0.75
      );
    });
  }

  private mapMediaManagement(rows: PcdRows, database: GeneratedDatabaseSource): ContentEntry[] {
    return rows.mediaManagement.map((config) => {
      const slug = slugify(`${config.subtype}-${config.arrType}-${config.name}`);
      const title = `${arrLabel(config.arrType)} ${mediaSubtypeLabel(config.subtype)}: ${config.name}`;
      const description = `${mediaSubtypeLabel(config.subtype)} configuration for ${arrLabel(config.arrType)}`;

      return entryBase(
        database,
        'media-management',
        slug,
        title,
        description,
        `/media-management/${config.subtype}/${slug}`,
        config,
        ['media-management', config.subtype, config.arrType],
        0.8
      );
    });
  }

  private addCustomFormatReferences(entries: ContentEntry[]) {
    const customFormats = entries.filter(entry => entry.type === 'custom-format');
    const qualityProfiles = entries.filter(entry => entry.type === 'quality-profile');

    for (const format of customFormats) {
      const referencedBy = [];

      for (const profile of qualityProfiles) {
        const profileFormats = [
          ...(profile.data?.custom_formats || []),
          ...(profile.data?.custom_formats_radarr || []),
          ...(profile.data?.custom_formats_sonarr || [])
        ];
        const match = profileFormats.find((item: any) => item.name === format.data?.name);

        if (match) {
          referencedBy.push({
            title: profile.title,
            slug: profile.slug,
            databaseId: profile.databaseId,
            score: match.score || 0
          });
        }
      }

      if (referencedBy.length > 0) {
        format.data = {
          ...format.data,
          referencedBy: referencedBy.sort((a, b) => b.score - a.score)
        };
      }
    }
  }

  private addRegexReferences(entries: ContentEntry[]) {
    const regexEntries = entries.filter(entry => entry.type === 'regex-pattern');
    const customFormats = entries.filter(entry => entry.type === 'custom-format');

    for (const regex of regexEntries) {
      const referencedBy = [];

      for (const format of customFormats) {
        const matchingConditions = (format.data?.conditions || []).filter((condition: any) => (
          condition.pattern === regex.data?.name
        ));

        if (matchingConditions.length > 0) {
          referencedBy.push({
            title: format.title,
            slug: format.slug,
            databaseId: format.databaseId,
            description: format.description,
            tags: format.data?.tags || [],
            conditionCount: matchingConditions.length
          });
        }
      }

      if (referencedBy.length > 0) {
        regex.data = {
          ...regex.data,
          referencedBy
        };
      }
    }
  }
}
