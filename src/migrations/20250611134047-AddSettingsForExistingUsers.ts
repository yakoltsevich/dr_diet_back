import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingsForExistingUsers20250611134047
  implements MigrationInterface
{
  name = 'AddSettingsForExistingUsers20250611134047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO user_settings ("userId", language, "ingredientSources")
        SELECT u.id, 'en', ''
        FROM users u
                 LEFT JOIN user_settings s ON s."userId" = u.id
        WHERE s."userId" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE
        FROM user_settings
        WHERE "userId" IN (SELECT u.id
                           FROM users u
                                    LEFT JOIN user_settings s ON s."userId" = u.id
                           WHERE s."language" = 'en'
                             AND s."ingredientSources" = '');
    `);
  }
}
