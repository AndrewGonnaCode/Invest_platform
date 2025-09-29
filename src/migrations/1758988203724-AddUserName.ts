import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserName1758988203724 implements MigrationInterface {
    name = 'AddUserName1758988203724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

}
