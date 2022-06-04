import {Command}           from "commander"
import {config as initEnv} from 'dotenv'
import {Database}             from "./database";
import {getOption, setOption} from "./option";

initEnv()

async function main() {
	const program = new Command()
	program
		.name("Simple migration")
		.option("--hash-only <boolean>", "only apply hash to database without running database", false)
	program.parse(process.argv)
	setOption(program.opts())

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