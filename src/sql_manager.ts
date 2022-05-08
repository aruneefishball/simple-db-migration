import fs              from "fs";
import {MigrationStep}          from "./migration_step";
import {findSql, readFileAsync} from "./utils";

export class SqlManager {
	constructor(private directory: string) {}

	async getSqlForDialect(dialect: string): Promise<string> {
		return readFileAsync(`./sql/${dialect}.sql`)
	}

	async loadMigrations(): Promise<MigrationStep[]> {
		return findSql(this.directory)
	}
}