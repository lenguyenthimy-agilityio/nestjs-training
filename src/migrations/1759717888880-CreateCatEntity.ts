import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCatEntity1759717888880 implements MigrationInterface {
    name = 'CreateCatEntity1759717888880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cats" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "age" integer NOT NULL, "breed" character varying, CONSTRAINT "UQ_2946bd8f9f4548076d1816289b8" UNIQUE ("name"), CONSTRAINT "PK_611e3c0a930b4ddc1541422864c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cats"`);
    }

}
