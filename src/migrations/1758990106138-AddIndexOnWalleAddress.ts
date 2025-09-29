import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexOnWalleAddress1758990106138 implements MigrationInterface {
    name = 'AddIndexOnWalleAddress1758990106138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fc71cd6fb73f95244b23e2ef11" ON "users" ("walletAddress") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fc71cd6fb73f95244b23e2ef11"`);
    }

}
