import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalDonations1759305474284 implements MigrationInterface {
    name = 'AddTotalDonations1759305474284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "totalDonations" numeric(36,18) DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "totalDonations"`);
    }

}
