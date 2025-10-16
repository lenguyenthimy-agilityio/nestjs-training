import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config(); // Load .env variables

export const getTypeOrmConfig = async (configService: ConfigService): Promise<DataSourceOptions> => {
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest) {
    // ✅ In-memory database for testing (no external DB needed)
    return {
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }
  return Promise.resolve({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  });
};

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});

export default dataSource;
