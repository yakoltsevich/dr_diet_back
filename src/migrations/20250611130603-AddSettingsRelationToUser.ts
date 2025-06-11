import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingsRelationToUser20250611130603
  implements MigrationInterface
{
  name = 'AddSettingsRelationToUser20250611130603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user_settings"
            ADD CONSTRAINT "FK_user_settings_user_id"
                FOREIGN KEY ("userId") REFERENCES "users" ("id")
                    ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user_settings"
        DROP
        CONSTRAINT "FK_user_settings_user_id";
    `);
  }
}
