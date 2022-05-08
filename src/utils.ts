import fs              from "fs";
import {MigrationStep} from "./migration_step";


export async function scanFolder(folder: string): Promise<string[]> {
	return new Promise<string[]>(function (ok, err) {
		fs.readdir(folder, function (e, files) {
			if (e) err(e)
			else ok(files)
		})
	})
}

export async function findSql(folder: string): Promise<MigrationStep[]> {
	return scanFolder(folder)
		.then(it =>
			it.filter(it => it.endsWith(".sql"))
			  .map(it => MigrationStep.parse(it).resolve(folder))
			  .sort((a, b) => a.step.localeCompare(b.step))
		)
}

export async function readFileAsync(filename: string): Promise<string> {
	return new Promise<string>(function (ok, err) {
		fs.readFile(filename, {encoding: "utf8"}, function (error, content) {
			if (error) err(error)
			else ok(content)
		})
	})
}