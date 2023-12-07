export DIR_BUILD_WORKSPACE_COMPILE := build/workspace/compile
export DIR_BUILD_WORKSPACE_PACKAGE := build/workspace/package

# --
# -- Makefile
# --

.PHONY: default
default:

# --
# -- Testing
# --

.PHONY: \
	test \
	test.watch \
	test.watch.coverage \
	test.clean \
	test.coverage.clean \
	test.coverage.open

test:
	npx vitest run \
		--config vitest.config.ts \
		--coverage \
		--reporter verbose \
		--segfault-retry 3

test.watch:
	npx vitest watch \
		--config vitest.config.ts \
		--reporter verbose \
		--segfault-retry 3

test.watch.coverage:
	npx vitest watch \
		--config vitest.config.ts \
		--coverage \
		--reporter verbose \
		--segfault-retry 3

test.clean: \
	test.coverage.clean

test.coverage.clean:
	rm -rf build/coverage

test.coverage.open:
	open build/coverage/index.html

# --
# -- Compile
# --

.PHONY: \
	compile \
	compile.workspace.clean \
	compile.workspace.setup \
	compile.workspace.setup.verify \
	compile.codebase \
	compile.codebase.verify \
	compile.codebase.clean

compile: \
	compile.workspace.clean \
	compile.workspace.setup \
	compile.workspace.setup.verify \
	compile.codebase \
	compile.codebase.verify \
	compile.codebase.clean

compile.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_COMPILE}

	rm -rf ./${DIR_BUILD_WORKSPACE_COMPILE}/*

compile.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_COMPILE}

compile.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}

compile.codebase:
	npx tsc -p build/tsconfig.json

compile.codebase.verify:
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/endpoint

	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/resource
	test -f ./${DIR_BUILD_WORKSPACE_COMPILE}/resource.js
	test -f ./${DIR_BUILD_WORKSPACE_COMPILE}/resource.d.ts

compile.codebase.clean:
	find ./${DIR_BUILD_WORKSPACE_COMPILE} -type f -name "*.test.js" -delete
	find ./${DIR_BUILD_WORKSPACE_COMPILE} -type f -name "*.test.d.ts" -delete

# --
# -- Package
# --

.PHONY: \
	package \
	package.workspace.clean \
	package.workspace.setup \
	package.workspace.setup.verify \
	package.meta \
	package.meta.verify

package: \
	package.workspace.clean \
	package.workspace.setup \
	package.workspace.setup.verify \
	package.meta \
	package.meta.verify

package.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_PACKAGE}

	rm -rf ./${DIR_BUILD_WORKSPACE_PACKAGE}/*

package.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_PACKAGE}

	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/endpoint
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/resource

	cp -r ./${DIR_BUILD_WORKSPACE_COMPILE}/* ./${DIR_BUILD_WORKSPACE_PACKAGE}/

package.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_PACKAGE}
	test -d ./${DIR_BUILD_WORKSPACE_PACKAGE}/endpoint
	test -d ./${DIR_BUILD_WORKSPACE_PACKAGE}/resource

package.meta:
	cp package.json ./${DIR_BUILD_WORKSPACE_PACKAGE}/package.json
	cp README.md ./${DIR_BUILD_WORKSPACE_PACKAGE}/README.md

package.meta.verify:
	test -f ./${DIR_BUILD_WORKSPACE_PACKAGE}/package.json
	test -f ./${DIR_BUILD_WORKSPACE_PACKAGE}/README.md
