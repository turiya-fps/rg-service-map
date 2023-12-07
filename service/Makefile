export DIR_BUILD_WORKSPACE_COMPILE := build/workspace/compile
export DIR_BUILD_WORKSPACE_CERIFICATES := build/workspace/certificates
export DIR_BUILD_WORKSPACE_PACKAGE := build/workspace/package
export DIR_BUILD_WORKSPACE_GLUE := build/workspace/glue
export DIR_BUILD_WORKSPACE_VENDOR := build/workspace/vendor
export DIR_BUILD_WORKSPACE_DATABASE := build/workspace/database

export CLIENT_PACKAGE_NAME := service-map-client
export CLIENT_PACKAGE := ../client/build/workspace/package

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
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/client
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/client/src/endpoint
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/client/src/resource

	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/service
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/service/src/handler

compile.codebase.clean:
	rm -rf ./${DIR_BUILD_WORKSPACE_COMPILE}/client

	find ./${DIR_BUILD_WORKSPACE_COMPILE} -type f -name '*.ts' -delete
	find ./${DIR_BUILD_WORKSPACE_COMPILE} -type f -name "*.test.js" -delete

	find ./${DIR_BUILD_WORKSPACE_COMPILE} -type f \( -name '*.js' -o -name '*.ts' \) \
		-exec $(if $(shell which gsed),gsed,sed) -i -E 's|\/src\/index||g' {} \; \
		-exec $(if $(shell which gsed),gsed,sed) -i -E 's|\/src||g' {} \;

# --
# -- Certificates
# --

.PHONY: \
	certificates \
	certificates.workspace.clean \
	certificates.workspace.setup \
	certificates.workspace.setup.verify \
	certificates.download \
	certificates.download.verify

certificates: \
	certificates.workspace.clean \
	certificates.workspace.setup \
	certificates.workspace.setup.verify \
	certificates.download \
	certificates.download.verify

certificates.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_CERIFICATES}

	rm -rf ./${DIR_BUILD_WORKSPACE_CERIFICATES}/*

certificates.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_CERIFICATES}

certificates.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_CERIFICATES}

certificates.download:
	# https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.CertificatesAllRegions
	# https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-administration.html#aurora-serverless-v2.tls
	# https://repost.aws/knowledge-center/users-connect-rds-iam
	curl https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem \
		--output ./${DIR_BUILD_WORKSPACE_CERIFICATES}/rds-ca-2019-root.pem

certificates.download.verify:
	test -f ./${DIR_BUILD_WORKSPACE_CERIFICATES}/rds-ca-2019-root.pem

# --
# -- Glue
# --

.PHONY: \
	glue \
	glue.script \
	glue.script.workspace.clean \
	glue.script.workspace.setup \
	glue.script.workspace.setup.verify \
	glue.script.workspace.build \
	glue.jar \
	glue.jar.workspace.clean \
	glue.jar.workspace.setup \
	glue.jar.workspace.setup.verify \
	glue.jar.workspace.install \
	glue.jar.workspace.install.verify

glue: \
	glue.script.workspace.clean \
	glue.script.workspace.setup \
	glue.script.workspace.setup.verify \
	glue.script.workspace.build \
	glue.jar.workspace.clean \
	glue.jar.workspace.setup \
	glue.jar.workspace.setup.verify \
	glue.jar.workspace.install \
	glue.jar.workspace.install.verify

glue.script: \
	glue.script.workspace.clean \
	glue.script.workspace.setup \
	glue.script.workspace.setup.verify \
	glue.script.workspace.build

glue.script.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_GLUE}/jar

	rm -rf ./${DIR_BUILD_WORKSPACE_GLUE}/script/*

glue.script.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_GLUE}/script

glue.script.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_GLUE}/script

glue.script.workspace.build:
	cp ../service/src/aws/glue/land-registry-data-sync.py ./${DIR_BUILD_WORKSPACE_GLUE}/script/land-registry-data-sync.py

glue.jar: \
	glue.jar.workspace.clean \
	glue.jar.workspace.setup \
	glue.jar.workspace.setup.verify \
	glue.jar.workspace.install \
	glue.jar.workspace.install.verify

glue.jar.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_GLUE}/jar

	rm -rf ./${DIR_BUILD_WORKSPACE_GLUE}/jar/*

glue.jar.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_GLUE}/jar

glue.jar.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_GLUE}/jar

glue.jar.workspace.install:
	curl -o ./${DIR_BUILD_WORKSPACE_GLUE}/jar/snowflake-jdbc-driver.jar "https://repo1.maven.org/maven2/net/snowflake/snowflake-jdbc/3.14.1/snowflake-jdbc-3.14.1.jar"
	curl -o ./${DIR_BUILD_WORKSPACE_GLUE}/jar/spark-snowflake-driver.jar "https://repo1.maven.org/maven2/net/snowflake/spark-snowflake_2.12/2.12.0-spark_3.3/spark-snowflake_2.12-2.12.0-spark_3.3.jar"
	curl -o ./${DIR_BUILD_WORKSPACE_GLUE}/jar/postgresql-driver.jar "https://jdbc.postgresql.org/download/postgresql-42.6.0.jar"

glue.jar.workspace.install.verify:
	test -f ./${DIR_BUILD_WORKSPACE_GLUE}/jar/snowflake-jdbc-driver.jar
	test -f ./${DIR_BUILD_WORKSPACE_GLUE}/jar/spark-snowflake-driver.jar
	test -f ./${DIR_BUILD_WORKSPACE_GLUE}/jar/postgresql-driver.jar

# --
# -- Package
# --

.PHONY: \
	package \
	package.workspace.clean \
	package.workspace.setup \
	package.workspace.setup.verify \
	package.service \
	package.service.verify \
	package.client \
	package.client.verify \
	package.certificates \
	package.certificates.verify \
	package.zip \
	package.zip.md5

package: \
	package.workspace.clean \
	package.workspace.setup \
	package.workspace.setup.verify \
	package.service \
	package.service.verify \
	package.client \
	package.client.verify \
	package.certificates \
	package.certificates.verify \
	package.zip \
	package.zip.md5

package.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_PACKAGE}

	rm -rf ./${DIR_BUILD_WORKSPACE_PACKAGE}/*
	rm -rf ./${DIR_BUILD_WORKSPACE_PACKAGE}.zip
	rm -rf ./${DIR_BUILD_WORKSPACE_PACKAGE}.zip.md5

package.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_PACKAGE}

package.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_PACKAGE}

package.service:
	cp -r ./${DIR_BUILD_WORKSPACE_COMPILE}/service/src/* ./${DIR_BUILD_WORKSPACE_PACKAGE}/

package.service.verify:
	test -d ./${DIR_BUILD_WORKSPACE_PACKAGE}/database
	test -d ./${DIR_BUILD_WORKSPACE_PACKAGE}/handler

package.client:
	cp package.json ./${DIR_BUILD_WORKSPACE_PACKAGE}/package.json
	cp README.md ./${DIR_BUILD_WORKSPACE_PACKAGE}/README.md

package.client.verify:
	test -f ./${DIR_BUILD_WORKSPACE_PACKAGE}/package.json
	test -f ./${DIR_BUILD_WORKSPACE_PACKAGE}/README.md

package.certificates:
	mkdir -p ./${DIR_BUILD_WORKSPACE_PACKAGE}/database/certificates
	cp ./${DIR_BUILD_WORKSPACE_CERIFICATES}/rds-ca-2019-root.pem ./${DIR_BUILD_WORKSPACE_PACKAGE}/database/certificates/rds-ca-2019-root.pem

package.certificates.verify:
	test -f ./${DIR_BUILD_WORKSPACE_PACKAGE}/database/certificates/rds-ca-2019-root.pem

package.zip:
	cd ./${DIR_BUILD_WORKSPACE_PACKAGE} && zip -r -q ../package.zip .

	test -f ./${DIR_BUILD_WORKSPACE_PACKAGE}.zip

	du -m -hs ${DIR_BUILD_WORKSPACE_PACKAGE}.zip

package.zip.md5:
	$(if $(shell which md5sum),md5sum,md5 -r) ./${DIR_BUILD_WORKSPACE_PACKAGE}.zip | awk '{ print $$1 }' > ./${DIR_BUILD_WORKSPACE_PACKAGE}.zip.md5

	test -f ./${DIR_BUILD_WORKSPACE_PACKAGE}.zip.md5

# --
# -- Vendor
# --

.PHONY: \
	vendor \
	vendor.workspace.clean \
	vendor.workspace.setup \
	vendor.workspace.setup.verify \
	vendor.install.prepare \
	vendor.install.prepare.verify \
	vendor.install \
	vendor.install.verify \
	vendor.install.client \
	vendor.install.client.verify \
	vendor.install.clean \
	vendor.layer \
	vendor.layer.verify \
	vendor.zip \
	vendor.zip.md5

vendor: \
	vendor.workspace.clean \
	vendor.workspace.setup \
	vendor.workspace.setup.verify \
	vendor.install.prepare \
	vendor.install.prepare.verify \
	vendor.install \
	vendor.install.verify \
	vendor.install.client \
	vendor.install.client.verify \
	vendor.install.clean \
	vendor.layer \
	vendor.layer.verify \
	vendor.zip \
	vendor.zip.md5

vendor.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_VENDOR}

	rm -rf ./${DIR_BUILD_WORKSPACE_VENDOR}/*
	rm -rf ./${DIR_BUILD_WORKSPACE_VENDOR}.zip
	rm -rf ./${DIR_BUILD_WORKSPACE_VENDOR}.zip.md5

vendor.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_VENDOR}

vendor.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_VENDOR}

vendor.install.prepare:
	cp ./package.json ./${DIR_BUILD_WORKSPACE_VENDOR}/package.json
	cp ../package-lock.json ./${DIR_BUILD_WORKSPACE_VENDOR}/package-lock.json

vendor.install.prepare.verify:
	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}/package.json
	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}/package-lock.json

vendor.install:
	cd ./${DIR_BUILD_WORKSPACE_VENDOR} && NODE_ENV=production npm install \
		--no-audit \
		--omit=optional \
		--omit=dev

vendor.install.verify:
	test -d ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules

vendor.install.client:
	test -d ./${CLIENT_PACKAGE}

	mkdir -p ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@project-rouge/${CLIENT_PACKAGE_NAME}
	cp -r ./${CLIENT_PACKAGE}/* ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@project-rouge/${CLIENT_PACKAGE_NAME}/

vendor.install.client.verify:
	test -d ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@project-rouge/${CLIENT_PACKAGE_NAME}

	test -d ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@project-rouge/${CLIENT_PACKAGE_NAME}/endpoint

	test -d ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@project-rouge/${CLIENT_PACKAGE_NAME}/resource
	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@project-rouge/${CLIENT_PACKAGE_NAME}/resource.js
	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@project-rouge/${CLIENT_PACKAGE_NAME}/resource.d.ts

vendor.install.clean:
	rm -rf ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/.bin
	rm -rf ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/@types

	rm -rf ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/typeorm/browser

	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.map' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '.npmignore' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '.jshintrc' -delete

	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname 'tsconfig*.json' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.ts' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.flow' -delete

	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.txt' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.html' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.css' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.scss' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.jpg' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.png' -delete
	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type f -iname '*.svg' -delete

	find ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules -type d -mindepth 1 -empty -delete

	du -hs ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules/* | sort -h
	du -hs ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules

vendor.layer:
	# https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html
	mkdir -p ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs

	mv ./${DIR_BUILD_WORKSPACE_VENDOR}/node_modules ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs

	mv ./${DIR_BUILD_WORKSPACE_VENDOR}/package.json ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs/package.json
	mv ./${DIR_BUILD_WORKSPACE_VENDOR}/package-lock.json ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs/package-lock.json

vendor.layer.verify:
	test -d ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs
	test -d ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs/node_modules

	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs/package.json
	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}/nodejs/package-lock.json

vendor.zip:
	cd ./${DIR_BUILD_WORKSPACE_VENDOR} && zip -r -q ../vendor.zip .

	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}.zip

	du -m -hs ./${DIR_BUILD_WORKSPACE_VENDOR}.zip

vendor.zip.md5:
	$(if $(shell which md5sum),md5sum,md5 -r) ./${DIR_BUILD_WORKSPACE_VENDOR}.zip | awk '{ print $$1 }' > ./${DIR_BUILD_WORKSPACE_VENDOR}.zip.md5

	test -f ./${DIR_BUILD_WORKSPACE_VENDOR}.zip.md5

# --
# -- Database
# --

.PHONY: \
	database \
	database.workspace.clean \
	database.workspace.setup \
	database.workspace.setup.verify \
	database.certificates \
	database.certificates.verify \
	database.compile \
	database.compile.verify \
	database.schema \
	database.schema.drop \
	database.schema.update \
	database.schema.rebuild

database: \
	database.workspace.clean \
	database.workspace.setup \
	database.workspace.setup.verify \
	database.certificates \
	database.certificates.verify \
	database.compile \
	database.compile.verify

database.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_DATABASE}

	rm -rf ./${DIR_BUILD_WORKSPACE_DATABASE}/*

database.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_DATABASE}
	mkdir -p ./${DIR_BUILD_WORKSPACE_DATABASE}/certificates

database.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_DATABASE}

database.certificates:
	test -d ./${DIR_BUILD_WORKSPACE_CERIFICATES}
	test -f ./${DIR_BUILD_WORKSPACE_CERIFICATES}/rds-ca-2019-root.pem

	cp -r ./${DIR_BUILD_WORKSPACE_CERIFICATES}/rds-ca-2019-root.pem ./${DIR_BUILD_WORKSPACE_DATABASE}/certificates/

database.certificates.verify:
	test -d ./${DIR_BUILD_WORKSPACE_DATABASE}/certificates
	test -f ./${DIR_BUILD_WORKSPACE_DATABASE}/certificates/rds-ca-2019-root.pem

database.compile:
	npx esbuild \
		--bundle \
		--platform=node \
		--target=node16 \
		--format=cjs \
		--external:aws-sdk \
		--external:esbuild \
		--external:typeorm \
		--external:pg \
		--external:pg-native \
		--log-level=error \
		--outfile=./${DIR_BUILD_WORKSPACE_DATABASE}/connection.cjs \
				./src/database/connection-cli.ts

database.compile.verify:
	test -f ./${DIR_BUILD_WORKSPACE_DATABASE}/connection.cjs

database.schema:
	npx typeorm-ts-node-commonjs -d src/database/connection-cli.ts schema:log

database.schema.update:
	npx typeorm-ts-node-commonjs -d src/database/connection-cli.ts schema:sync

database.schema.drop:
	npx typeorm-ts-node-commonjs -d src/database/connection-cli.ts schema:drop

database.schema.rebuild: \
	database.schema.drop \
	database.schema.update

# --
# -- Local
# --

.PHONY: \
	local \
	local.watch

local:
	npx tsx ./src/server.ts

local.watch:
	npx tsx --watch ./src/server.ts
