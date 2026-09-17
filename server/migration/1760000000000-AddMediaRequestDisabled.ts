import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMediaRequestDisabled1760000000000
  implements MigrationInterface
{
  name = 'AddMediaRequestDisabled1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media" ADD "requestDisabled" boolean NOT NULL DEFAULT (0)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media" DROP COLUMN "requestDisabled"`
    );
  }
}
