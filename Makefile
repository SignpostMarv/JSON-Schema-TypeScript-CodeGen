install:
	@npm install

build:
	@echo 'building from ./tsconfig.app.json'
	@./node_modules/.bin/tsc --project ./tsconfig.app.json

lint--tsc:
	@echo 'running syntax check'
	@./node_modules/.bin/tsc --project ./tsconfig.app-check.json

lint--prettier:
	@echo 'running prettier'
	@./node_modules/.bin/prettier . --check

lint--eslint:
	@./node_modules/.bin/tsc --project ./tsconfig.eslint.json
	@echo 'checking eslint for all issues with config'
	@./node_modules/.bin/eslint --config eslint.config.js.mjs --cache './**/*.mjs'
	@echo 'checking eslint for all issues'
	@./node_modules/.bin/eslint --cache './**/*.ts'

lint: lint--prettier lint--tsc lint--eslint

.PHONY: tests
tests: lint
	@node ./tests.ts

.PHONY: coverage
coverage: lint coverage--skip-lint

coverage--skip-lint:
	@./node_modules/.bin/c8 node ./tests.ts

npm-prep: tests
	@echo 'building from ./tsconfig.app-npm.json'
	@./node_modules/.bin/tsc --project ./tsconfig.app-npm.json
	@npm publish --dry-run
