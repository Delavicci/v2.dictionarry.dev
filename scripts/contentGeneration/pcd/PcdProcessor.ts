import { ContentEntry, DataSourceConfig, GeneratedDatabaseSource } from '../core/types';
import { DataSource } from '../core/DataSource';
import { PcdCompiler } from './PcdCompiler';
import { PcdReader } from './PcdReader';
import { PcdContentMapper } from './PcdContentMapper';

export class PcdProcessor {
  name = 'pcd';

  async processAll(source: DataSource, database: GeneratedDatabaseSource, sourceConfig: DataSourceConfig): Promise<ContentEntry[]> {
    const compiler = new PcdCompiler();
    const compiled = await compiler.compile(source, sourceConfig);

    try {
      const rows = new PcdReader(compiled).read();
      database.name = rows.manifest.name || database.name;
      database.description = rows.manifest.description || database.description;
      database.version = rows.manifest.version || database.version;
      database.arrTypes = rows.manifest.arr_types || database.arrTypes;

      return new PcdContentMapper().map(rows, database);
    } finally {
      compiled.cleanup();
    }
  }
}
