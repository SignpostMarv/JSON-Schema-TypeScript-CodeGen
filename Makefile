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

lint--oxlint:
	@./node_modules/.bin/oxlint

lint: lint--prettier lint--tsc lint--oxlint

.PHONY: tests
tests: lint
	@node --test

.PHONY: coverage
coverage: lint coverage--skip-lint

coverage--skip-lint:
	@node --experimental-test-coverage --test-coverage-include='${PWD}/src/**/*.ts' --test

coverage--lcov:
	@node --experimental-test-coverage --test-coverage-include='${PWD}/src/**/*.ts' --test --test-reporter=lcov --test-reporter-destination=coverage/lcov.info

npm-prep: tests
	@echo 'building from ./tsconfig.app-npm.json'
	@./node_modules/.bin/tsc --project ./tsconfig.app-npm.json
	@npm publish --dry-run
