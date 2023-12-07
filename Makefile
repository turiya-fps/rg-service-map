# --
# -- Makefile
# --

.PHONY: default
default:

# --
# -- Code Formatting
# --

.PHONY: \
	code \
	code.fix

code:
	npx eslint \
		--cache \
		--cache-location .eslintcache \
		--format codeframe \
			./client \
			./deploy \
			./service

code.fix:
	npx eslint \
		--cache \
		--cache-location .eslintcache \
		--fix \
		--format codeframe \
			./client \
			./deploy \
			./service

# --
# -- Building: Docker
# --

.PHONY: \
	docker \
	docker.clean \
	docker.build \
	docker.validate

docker: \
	docker.clean \
	docker.build \
	docker.build.validate

docker.clean:
	rm -rf ./service/build/workspace/package.zip
	rm -rf ./service/build/workspace/package.zip.md5

	rm -rf ./service/build/workspace/vendor.zip.md5
	rm -rf ./service/build/workspace/vendor.zip.md5

	rm -rf ./service/build/workspace/glue/jar
	rm -rf ./service/build/workspace/glue/script

docker.build:
	test -n "${NPM_TOKEN}"

	mkdir -p ./service/build/workspace
	mkdir -p ./service/build/workspace/glue/jar
	mkdir -p ./service/build/workspace/glue/script

	docker build \
		--build-arg NPM_TOKEN=${NPM_TOKEN} \
		--progress plain \
		--tag service:build \
			.

	docker create --name build-data service:build sh

	docker cp build-data:/data/package.zip ./service/build/workspace/package.zip
	docker cp build-data:/data/package.zip.md5 ./service/build/workspace/package.zip.md5

	docker cp build-data:/data/vendor.zip ./service/build/workspace/vendor.zip
	docker cp build-data:/data/vendor.zip.md5 ./service/build/workspace/vendor.zip.md5

	docker cp build-data:/data/glue/jar/postgresql-driver.jar ./service/build/workspace/glue/jar/postgresql-driver.jar
	docker cp build-data:/data/glue/jar/snowflake-jdbc-driver.jar ./service/build/workspace/glue/jar/snowflake-jdbc-driver.jar
	docker cp build-data:/data/glue/jar/spark-snowflake-driver.jar ./service/build/workspace/glue/jar/spark-snowflake-driver.jar
	docker cp build-data:/data/glue/script/land-registry-data-sync.py ./service/build/workspace/glue/script/land-registry-data-sync.py

	docker rm build-data

docker.build.validate:
	test -f ./service/build/workspace/package.zip
	test -f ./service/build/workspace/package.zip.md5

	test -f ./service/build/workspace/vendor.zip.md5
	test -f ./service/build/workspace/vendor.zip.md5

	test -f ./service/build/workspace/glue/jar/postgresql-driver.jar
	test -f ./service/build/workspace/glue/jar/snowflake-jdbc-driver.jar
	test -f ./service/build/workspace/glue/jar/spark-snowflake-driver.jar
	test -f ./service/build/workspace/glue/script/land-registry-data-sync.py
