import {config as initEnv} from 'dotenv'
import {Database}          from "./database";

initEnv()

async function main() {
	if (!process.env.DATABASE) throw Error("Please set `DATABASE` in .env")
	let db: Database
	try {
		db = await Database.init(process.env.DATABASE)
		await db.runMigrations()
	} catch (e) {
		throw e
	} finally {
		await db?.close()
	}
}

main()
	.then()
	.catch(it => {
		console.error(it)
		process.exit(1)
	})