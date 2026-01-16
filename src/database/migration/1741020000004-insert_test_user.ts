/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateInsertTestUser1741020000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    queryRunner.query(`
      INSERT INTO "user" (
        id,
        "firstName",
        "lastName",
        email,
        password,
        role,
        "createdAt",
        "updatedAt"
      ) VALUES (
        uuid_generate_v4(),
        'Teste',
        'Admin',
        'admin@epaper.com',
        '${hashedPassword}',
        'ADMIN',
        now(),
        now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      DELETE FROM "user"
      WHERE email = 'admin@epaper.com';
    `);
  }
}
