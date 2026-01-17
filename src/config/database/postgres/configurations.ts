import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isTest = process.env.NODE_ENV === 'test';

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB,
    entities: isTest 
      ? ['src/**/*.entity.ts'] 
      : ['dist/**/*.entity{.ts,.js}'],
    migrations: isTest 
      ? ['src/database/migration/*.ts'] 
      : ['dist/database/migration/{*.ts,*.js}'],
    migrationsRun: true,
    synchronize: false,
    logging: true,
  };
};