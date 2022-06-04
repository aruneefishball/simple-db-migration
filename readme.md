# Simple migration

## Usage

+ create .sql file and store into `migrations` folder (can be change via .env file)
+ run `npm i`
+ run `npm run start`

### Arguments
Pass by `npm run start -- <arg>=value`

| arg         | description                                       | value      |  
|-------------|---------------------------------------------------|------------|
| --hash-only | only apply migration step but not apply migration | true/false |

## Hint

If error occur it will exit with non-zero status code and error in stderr

## TODO

- [ ] cli to help to create migration
- [x] checkpoint (undo if migration fail)
- [ ] another database