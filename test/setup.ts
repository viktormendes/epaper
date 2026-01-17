import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { DbTest } from './create-db';

export let testApp: INestApplication;
export const testRef = {} as { app: INestApplication };

const dbTest = new DbTest();

beforeAll(async () => {
  console.log('📦 Criando banco de teste...');
  await dbTest.create();
  
  console.log('🔧 Configurando DATABASE_DB:', dbTest.dbName);
  process.env.DATABASE_DB = dbTest.dbName;

  console.log('🚀 Inicializando NestJS...');
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  testApp = moduleFixture.createNestApplication();
  testRef.app = testApp;

  testApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await testApp.init();
  console.log('✅ Setup completo!');
}, 30000);

beforeEach(async () => {
  const dataSource = testApp.get(DataSource);
  
  await dataSource.query('SET session_replication_role = replica;');
  
  const entities = dataSource.entityMetadatas;
  for (const entity of entities) {
    await dataSource.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
  }
  
  await dataSource.query('SET session_replication_role = DEFAULT;');
});

afterAll(async () => {
  console.log('🧹 Limpando...');
  if (testApp) {
    await testApp.close();
  }
  await dbTest.deleteAll();
  console.log('✅ Cleanup completo!');
});