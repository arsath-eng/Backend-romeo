import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './data-source';

// This will load environment values.
ConfigModule.forRoot(/* Pass here the same options that you would pass when
calling this method from your root module */{
    isGlobal: true,
});

// This will be used by the cli
export default new DataSource(buildDataSourceOptions(new ConfigService()));