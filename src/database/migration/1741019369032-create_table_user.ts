/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUser1741019369032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE "user" (
          id SERIAL PRIMARY KEY,
          "firstName" VARCHAR NOT NULL,
          "lastName" VARCHAR NOT NULL,
          email VARCHAR UNIQUE NOT NULL,
          "avatarUrl" VARCHAR,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          password VARCHAR NOT NULL,
          role VARCHAR NOT NULL DEFAULT 'USER',
          "hashedRefreshToken" TEXT,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DROP TABLE user    
    `);
  }
}
