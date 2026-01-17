import { DataSource } from 'typeorm';

export class DbTest extends DataSource {
  public dbName: string = 'epaper_test';

  constructor() {
    super({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: 'postgres',
    });
  }

  async create(index = 0) {
    if (!this.isInitialized) await this.initialize();

    try {
      this.dbName = `epaper_test_db`;
      console.log("name", this.dbName)
      await this.query(`CREATE DATABASE "${this.dbName}"`);
      await this.destroy();
    } catch (error) {
      console.warn('Falha ao criar DB, tentando novamente...', error);
      await this.create(index + 1);
    }
  }

  async deleteAll() {
    await this.initialize();

    const databases: { datname: string }[] = await this.query(
      "SELECT datname FROM pg_database WHERE datname LIKE 'epaper_test_db'"
    );

    for (const db of databases) {
      try {
        await this.query(`DROP DATABASE IF EXISTS "${db.datname}"`);
      } catch (err) {
        console.warn(`Falha ao dropar DB ${db.datname}`, err);
      }
    }

    await this.destroy();
  }
}
