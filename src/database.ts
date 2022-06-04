import path                    from "path";
import {QueryTypes, Sequelize} from "sequelize";
import {MigrationStep}         from "./migration_step";
import {getOption}             from "./option";
import {SqlManager}            from "./sql_manager";

export class Database {
	sequelize: Sequelize
	dialect: string
	manager: SqlManager
	cachedStep?: DbStep[]
	cachedMigrations?: MigrationStep[]

	static async init(database: string): Promise<Database> {
		const seq = new Sequelize(database, {
			logging: !!process.env.DEBUG
		})
		await seq.authenticate()
		try {
			const db = new Database()
			db.dialect = database.split(':', 2)[0]
			db.sequelize = seq
			db.manager = new SqlManager(process.env.FOLDER || "migrations")
			await db.init_migration()
			await db.verify()
			return db
		} catch (e) {
			await seq.close()
			throw e
		}
	}

	async init_migration() {
		const query = await this.manager.getSqlForDialect(this.dialect)
		await this.sequelize.query(query)
	}

	async verify() {
		if (process.env.NOVERIFY) return

		const steps = this.cachedStep = await this.getMigratedSteps()
		const localSteps = this.cachedMigrations = await this.manager.loadMigrations()

		if (steps.length > localSteps.length) throw `Invalid migrations expected >= ${steps.length} but was ${localSteps.length}`

		for (let i = 0, len = steps.length; i < len; ++i) {
			const applied = steps[i]
			const localHash = await localSteps[i].hashOnly()
			if (applied.hash != localHash) {
				if (!process.env.IGNORE_INVALID_HASH)
					throw `Invalid migration hash on step ${applied.step} expected ${applied.hash} but was ${localHash}`
				else
					await this.updateHash(applied.step, localHash)
			}
		}
	}

	async runMigrations() {
		let migrated: DbStep[] = []
		if (this.cachedStep) migrated = this.cachedStep
		if (!migrated?.length) migrated = await this.getMigratedSteps()

		let startAt: string = ''

		if (migrated.length) {
			const lastStep = migrated[migrated.length - 1]
			if (lastStep)
				startAt = lastStep.step
		}

		let localSteps = this.cachedMigrations
		if (!localSteps) localSteps = await this.manager.loadMigrations()
		localSteps = localSteps.filter(it => it.step.localeCompare(startAt) > 0)
		if (localSteps.length < 1) {
			console.log("No migration to apply")
			return
		}
		for (let localStep of localSteps) {
			await this.exec(localStep)
		}
	}

	async exec(step: MigrationStep) {
		try {
			const sql = await step.read()
			if (sql?.length < 1) {
				if (!process.env.SKIP_EMPTY)
					return Promise.reject("Empty sql file!")
			}

			// user tell us to skip
			if (!getOption().hashOnly)
				await this.sequelize.query(`
						${sql}
						`, {
					raw : true,
					type: QueryTypes.RAW
				})
			// if error it will fall into catch block
			await this.incrementStep(step)
		} catch (e) {
			console.error(e)
			throw e
		}
	}

	close(): Promise<void> {
		const {sequelize} = this
		return (async function () {
			await sequelize.close()
		})()
	}

	toString() {
		return `[driver:${this.dialect}]`
	}

	private async updateHash(step: string, hash: string) {
		console.error(`[warn] Updated hash of step ${step}`)
		return this.sequelize.query("UPDATE TOP 1 __migration SET hash=$1 WHERE step=$2", {
			bind: [hash, step],
			type: QueryTypes.UPDATE
		})
	}

	private async incrementStep(step: MigrationStep) {
		if (!step.hash)
			await step.hashContent()
		const identifier = path.basename(step.file)
		console.log(`Applied ${identifier}`)
		return this.sequelize.query("INSERT INTO __migration (step, hash, identifier) VALUES ($1,$2,$3)", {
			bind       : [step.step, step.hash, identifier],
			type       : QueryTypes.INSERT,
			transaction: null
		})
	}

	private async getMigratedSteps(): Promise<DbStep[]> {
		return this.sequelize.query("SELECT * FROM __migration ORDER BY step", {type: QueryTypes.SELECT})
	}
}

export type DbStep = {
	step: string
	hash: string
	identifier: string
}