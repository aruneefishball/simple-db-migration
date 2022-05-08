import crypto          from "crypto";
import path            from "path"
import {readFileAsync} from "./utils";

export class MigrationStep {
	hash?: string
	sql?: string

	constructor(public step: string, public file: string) { }

	static parse(filename: string): MigrationStep {
		const step = filename.split('_', 2)?.[0]
		if (!step) return null
		return new MigrationStep(step, filename)
	}

	resolve(folder: string): MigrationStep {
		this.file = path.resolve(folder, this.file)
		return this
	}

	async hashContent(): Promise<string> {
		if (this.hash)
			return this.hash

		if (!this.sql)
			return this.hashSQL(await this.read())
		else
			return this.hashSQL(this.sql)
	}

	async hashOnly(): Promise<string> {
		const hash = await this.hashContent()
		this.sql = undefined
		return hash
	}

	async read(): Promise<string> {
		const sql = this.sql = await readFileAsync(this.file)
		this.hash = this.hashSQL(sql)
		return sql
	}

	toString() {
		return `[${this.step}] (${this.file})`
	}

	private hashSQL(sql) {
		return crypto.createHash('sha384').update(sql).digest('base64url')
	}
}