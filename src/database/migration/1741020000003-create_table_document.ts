/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableDocument1741020000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE "document" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        "documentNumber" VARCHAR NOT NULL,
        role "origin_enum" NOT NULL,
        "documentType" "document_type_enum" NOT NULL,
        "totalTaxAmount" DECIMAL(15, 2) DEFAULT 0 NOT NULL,
        "netAmount" DECIMAL(15, 2) DEFAULT 0 NOT NULL,
        "fileKey" VARCHAR(1000),
        "fileUrl" VARCHAR(1000),
        "fileName" VARCHAR(255),
        "fileType" "file_type_enum",
        description VARCHAR,
        "issuerId" UUID NOT NULL,
        "createdByUserId" UUID NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

        CONSTRAINT "FK_document_issuer"
          FOREIGN KEY ("issuerId")
          REFERENCES "issuer"(id)
          ON DELETE RESTRICT,

        CONSTRAINT "FK_document_user"
          FOREIGN KEY ("createdByUserId")
          REFERENCES "user"(id)
          ON DELETE RESTRICT
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      DROP TABLE "document";
    `);
  }
}
