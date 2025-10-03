import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarToCampaigns1759490476133 implements MigrationInterface {
    name = 'AddAvatarToCampaigns1759490476133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "avatarUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "avatarUrl"`);
    }

}
