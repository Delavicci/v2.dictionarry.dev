import { CompiledPcd } from './PcdCompiler';

export interface PcdRows {
  manifest: CompiledPcd['manifest'];
  regularExpressions: any[];
  customFormats: any[];
  qualityProfiles: any[];
  delayProfiles: any[];
  mediaManagement: any[];
}

function key(...parts: string[]) {
  return parts.join('\u0000');
}

function toBool(value: any): boolean {
  return value === 1 || value === true;
}

function bytesToGb(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Math.round((Number(value) / 1024 / 1024 / 1024) * 100) / 100;
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const itemKey = getKey(item);
    grouped.set(itemKey, [...(grouped.get(itemKey) || []), item]);
  }
  return grouped;
}

function tagsFromRows(rows: any[], entityNameColumn: string): Map<string, string[]> {
  const tags = new Map<string, string[]>();
  for (const row of rows) {
    const entityName = row[entityNameColumn];
    tags.set(entityName, [...(tags.get(entityName) || []), row.tag_name]);
  }
  return tags;
}

export class PcdReader {
  constructor(private compiled: CompiledPcd) {}

  read(): PcdRows {
    const regularExpressions = this.readRegularExpressions();
    const customFormats = this.readCustomFormats();
    const qualityProfiles = this.readQualityProfiles(customFormats);
    const delayProfiles = this.readDelayProfiles();
    const mediaManagement = this.readMediaManagement();

    return {
      manifest: this.compiled.manifest,
      regularExpressions,
      customFormats,
      qualityProfiles,
      delayProfiles,
      mediaManagement
    };
  }

  private tableExists(table: string): boolean {
    const rows = this.compiled.queryAll<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${JSON.stringify(table)}`
    );
    return rows.length > 0;
  }

  private readRegularExpressions() {
    const rows = this.compiled.queryAll('SELECT * FROM regular_expressions ORDER BY name');
    const tags = tagsFromRows(
      this.compiled.queryAll('SELECT * FROM regular_expression_tags ORDER BY regular_expression_name, tag_name'),
      'regular_expression_name'
    );

    return rows.map((row: any) => ({
      ...row,
      tags: tags.get(row.name) || []
    }));
  }

  private readCustomFormats() {
    const formats = this.compiled.queryAll('SELECT * FROM custom_formats ORDER BY name');
    const tags = tagsFromRows(
      this.compiled.queryAll('SELECT * FROM custom_format_tags ORDER BY custom_format_name, tag_name'),
      'custom_format_name'
    );
    const conditionRows = this.compiled.queryAll('SELECT * FROM custom_format_conditions ORDER BY custom_format_name, name');
    const tests = groupBy(
      this.compiled.queryAll('SELECT * FROM custom_format_tests ORDER BY custom_format_name, title'),
      (row: any) => row.custom_format_name
    );

    const patternRows = new Map(this.compiled.queryAll('SELECT * FROM condition_patterns').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const languageRows = new Map(this.compiled.queryAll('SELECT * FROM condition_languages').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const flagRows = new Map(this.compiled.queryAll('SELECT * FROM condition_indexer_flags').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const sourceRows = new Map(this.compiled.queryAll('SELECT * FROM condition_sources').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const resolutionRows = new Map(this.compiled.queryAll('SELECT * FROM condition_resolutions').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const modifierRows = new Map(this.compiled.queryAll('SELECT * FROM condition_quality_modifiers').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const sizeRows = new Map(this.compiled.queryAll('SELECT * FROM condition_sizes').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const releaseTypeRows = new Map(this.compiled.queryAll('SELECT * FROM condition_release_types').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));
    const yearRows = new Map(this.compiled.queryAll('SELECT * FROM condition_years').map((row: any) => [
      key(row.custom_format_name, row.condition_name),
      row
    ]));

    const conditions = groupBy(conditionRows.map((condition: any) => {
      const conditionKey = key(condition.custom_format_name, condition.name);
      const pattern = patternRows.get(conditionKey) as any;
      const language = languageRows.get(conditionKey) as any;
      const flag = flagRows.get(conditionKey) as any;
      const source = sourceRows.get(conditionKey) as any;
      const resolution = resolutionRows.get(conditionKey) as any;
      const modifier = modifierRows.get(conditionKey) as any;
      const size = sizeRows.get(conditionKey) as any;
      const releaseType = releaseTypeRows.get(conditionKey) as any;
      const year = yearRows.get(conditionKey) as any;

      return {
        name: condition.name,
        customFormatName: condition.custom_format_name,
        type: condition.type,
        arrType: condition.arr_type,
        negate: toBool(condition.negate),
        required: toBool(condition.required),
        pattern: pattern?.regular_expression_name,
        language: language?.language_name,
        exceptLanguage: language ? toBool(language.except_language) : undefined,
        flag: flag?.flag,
        source: source?.source,
        resolution: resolution?.resolution,
        qualityModifier: modifier?.quality_modifier,
        minSize: bytesToGb(size?.min_bytes),
        maxSize: bytesToGb(size?.max_bytes),
        minSizeUnit: size?.min_bytes ? 'GB' : undefined,
        maxSizeUnit: size?.max_bytes ? 'GB' : undefined,
        releaseType: releaseType?.release_type,
        minYear: year?.min_year,
        maxYear: year?.max_year
      };
    }), (condition: any) => condition.customFormatName);

    return formats.map((format: any) => ({
      ...format,
      include_in_rename: toBool(format.include_in_rename),
      tags: tags.get(format.name) || [],
      conditions: conditions.get(format.name) || [],
      tests: (tests.get(format.name) || []).map((test: any) => ({
        ...test,
        should_match: toBool(test.should_match)
      }))
    }));
  }

  private readQualityProfiles(customFormats: any[]) {
    const profiles = this.compiled.queryAll('SELECT * FROM quality_profiles ORDER BY name');
    const tags = tagsFromRows(
      this.compiled.queryAll('SELECT * FROM quality_profile_tags ORDER BY quality_profile_name, tag_name'),
      'quality_profile_name'
    );
    const languages = groupBy(
      this.compiled.queryAll('SELECT * FROM quality_profile_languages ORDER BY quality_profile_name, language_name'),
      (row: any) => row.quality_profile_name
    );
    const qualities = groupBy(
      this.compiled.queryAll('SELECT * FROM quality_profile_qualities ORDER BY quality_profile_name, position'),
      (row: any) => row.quality_profile_name
    );
    const qualityGroups = groupBy(
      this.compiled.queryAll('SELECT * FROM quality_groups ORDER BY quality_profile_name, name'),
      (row: any) => row.quality_profile_name
    );
    const groupMembers = groupBy(
      this.compiled.queryAll('SELECT * FROM quality_group_members ORDER BY quality_profile_name, quality_group_name, quality_name'),
      (row: any) => key(row.quality_profile_name, row.quality_group_name)
    );
    const scoring = groupBy(
      this.compiled.queryAll('SELECT * FROM quality_profile_custom_formats ORDER BY quality_profile_name, custom_format_name, arr_type'),
      (row: any) => row.quality_profile_name
    );
    const customFormatMap = new Map(customFormats.map(format => [format.name, format]));

    return profiles.map((profile: any) => {
      const groups = new Map((qualityGroups.get(profile.name) || []).map((group: any) => [
        group.name,
        {
          id: group.name,
          name: group.name,
          qualities: (groupMembers.get(key(profile.name, group.name)) || []).map((member: any) => ({
            name: member.quality_name
          }))
        }
      ]));

      const qualityItems = (qualities.get(profile.name) || []).map((quality: any) => {
        if (quality.quality_group_name) {
          return groups.get(quality.quality_group_name) || {
            id: quality.quality_group_name,
            name: quality.quality_group_name,
            qualities: []
          };
        }

        return {
          id: quality.quality_name,
          name: quality.quality_name,
          qualities: [{ name: quality.quality_name }]
        };
      });

      const scoreRows = scoring.get(profile.name) || [];
      const toScoreItem = (score: any) => {
        const customFormat = customFormatMap.get(score.custom_format_name) as any;
        return {
          name: score.custom_format_name,
          score: score.score,
          tags: customFormat?.tags || [],
          conditions: customFormat?.conditions || [],
          description: customFormat?.description || ''
        };
      };

      const upgradeUntilRow = (qualities.get(profile.name) || []).find((quality: any) => toBool(quality.upgrade_until));

      return {
        ...profile,
        tags: tags.get(profile.name) || [],
        languages: (languages.get(profile.name) || []).map((language: any) => ({
          name: language.language_name,
          type: language.type || 'simple'
        })),
        upgradesAllowed: toBool(profile.upgrades_allowed),
        minCustomFormatScore: profile.minimum_custom_format_score,
        upgradeUntilScore: profile.upgrade_until_score,
        minScoreIncrement: profile.upgrade_score_increment,
        qualities: qualityItems,
        upgrade_until: upgradeUntilRow ? {
          id: upgradeUntilRow.quality_group_name || upgradeUntilRow.quality_name,
          name: upgradeUntilRow.quality_group_name || upgradeUntilRow.quality_name
        } : null,
        custom_formats: scoreRows.filter((score: any) => score.arr_type === 'all').map(toScoreItem),
        custom_formats_radarr: scoreRows.filter((score: any) => score.arr_type === 'radarr').map(toScoreItem),
        custom_formats_sonarr: scoreRows.filter((score: any) => score.arr_type === 'sonarr').map(toScoreItem)
      };
    });
  }

  private readDelayProfiles() {
    if (!this.tableExists('delay_profiles')) {
      return [];
    }

    return this.compiled.queryAll('SELECT * FROM delay_profiles ORDER BY name').map((profile: any) => ({
      ...profile,
      bypass_if_highest_quality: toBool(profile.bypass_if_highest_quality),
      bypass_if_above_custom_format_score: toBool(profile.bypass_if_above_custom_format_score)
    }));
  }

  private readMediaManagement() {
    const mediaManagement = [];
    mediaManagement.push(...this.compiled.queryAll('SELECT * FROM radarr_naming ORDER BY name').map(row => ({
      subtype: 'naming',
      arrType: 'radarr',
      ...row
    })));
    mediaManagement.push(...this.compiled.queryAll('SELECT * FROM sonarr_naming ORDER BY name').map(row => ({
      subtype: 'naming',
      arrType: 'sonarr',
      ...row
    })));
    mediaManagement.push(...this.compiled.queryAll('SELECT * FROM radarr_media_settings ORDER BY name').map(row => ({
      subtype: 'media-settings',
      arrType: 'radarr',
      ...row
    })));
    mediaManagement.push(...this.compiled.queryAll('SELECT * FROM sonarr_media_settings ORDER BY name').map(row => ({
      subtype: 'media-settings',
      arrType: 'sonarr',
      ...row
    })));

    const radarrQualityDefinitions = groupBy(
      this.compiled.queryAll('SELECT * FROM radarr_quality_definitions ORDER BY name, quality_name'),
      (row: any) => row.name
    );
    const sonarrQualityDefinitions = groupBy(
      this.compiled.queryAll('SELECT * FROM sonarr_quality_definitions ORDER BY name, quality_name'),
      (row: any) => row.name
    );

    for (const [name, definitions] of radarrQualityDefinitions) {
      mediaManagement.push({
        subtype: 'quality-definitions',
        arrType: 'radarr',
        name,
        definitions
      });
    }

    for (const [name, definitions] of sonarrQualityDefinitions) {
      mediaManagement.push({
        subtype: 'quality-definitions',
        arrType: 'sonarr',
        name,
        definitions
      });
    }

    return mediaManagement.map((config: any) => ({
      ...config,
      rename: config.rename === undefined ? undefined : toBool(config.rename),
      replace_illegal_characters: config.replace_illegal_characters === undefined ? undefined : toBool(config.replace_illegal_characters),
      enable_media_info: config.enable_media_info === undefined ? undefined : toBool(config.enable_media_info)
    }));
  }
}
