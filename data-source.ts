import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Cat } from './src/cats/entities/cat.entity';

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'catsdb',
  entities: [Cat],
  migrations: [isProduction ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // never true when using migrations
});
