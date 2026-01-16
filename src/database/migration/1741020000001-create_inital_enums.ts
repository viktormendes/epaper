/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnums1741020000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM (
        'PAYMENT_RECEIPT',
        'INVOICE',
        'SERVICE_ORDER',
        'MANUAL_NUMBER',
        'MEDICAL_CERTIFICATE',
        'MEETING_MINUTES'
      );

      CREATE TYPE "file_type_enum" AS ENUM (
        'PDF',
        'JPG',
        'PNG'
      );

      CREATE TYPE "origin_enum" AS ENUM (
        'SCANNED',
        'ELECTRONIC'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      DROP TYPE IF EXISTS "origin_enum";
      DROP TYPE IF EXISTS "file_type_enum";
      DROP TYPE IF EXISTS "document_type_enum";
    `);
  }
}
