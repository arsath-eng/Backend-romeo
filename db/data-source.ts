import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';


export const dataSourceOptions: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: buildDataSourceOptions,
    inject: [ConfigService],
};

export function buildDataSourceOptions(configService: ConfigService): DataSourceOptions {
    return {
        type: "postgres",
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        logging: false,
        subscribers: [],
        entities: [
            "dist/**/*.entity{.ts,.js}"
        ],
        ssl: {
            rejectUnauthorized: false
        },
        synchronize: false,
        migrations: ["dist/db/migrations/*.js"],
    };
}

