export DIR_BUILD_WORKSPACE_COMPILE := build/workspace/compile
export DIR_BUILD_WORKSPACE_TERRAFORM := build/workspace/terraform

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
	compile.types \
	compile.codebase \
	compile.codebase.verify

compile: \
	compile.workspace.clean \
	compile.workspace.setup \
	compile.workspace.setup.verify \
	compile.codebase \
	compile.codebase.verify

compile.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_COMPILE}

	rm -rf ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks
	rm -rf ./${DIR_BUILD_WORKSPACE_COMPILE}/manifest.json

compile.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_COMPILE}
	mkdir -p ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks

compile.workspace.setup.verify:
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks

compile.types:
	npx tsc

compile.codebase:
	npx tsx ./src/main.ts

compile.codebase.verify:
	test -f ./${DIR_BUILD_WORKSPACE_COMPILE}/manifest.json

	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks
	test -d ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks/target
	test -f ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks/target/cdk.tf.json

# --
# -- Terraform
# --

.PHONY: \
	terraform \
	terraform.workspace \
	terraform.workspace.clean \
	terraform.workspace.setup \
	terraform.workspace.setup.verify \
	terraform.init \
	terraform.init.upgrade \
	terraform.stack.plan \
	terraform.stack.plan.destroy \
	terraform.stack.apply \
	terraform.stack.apply.destroy

terraform: \
	terraform.workspace \
	terraform.init

terraform.workspace: \
	terraform.workspace.clean \
	terraform.workspace.setup \
	terraform.workspace.setup.verify

terraform.workspace.clean:
	test ! -z ${DIR_BUILD_WORKSPACE_TERRAFORM}

	rm -rf ./${DIR_BUILD_WORKSPACE_TERRAFORM}/*
	rm -rf ./${DIR_BUILD_WORKSPACE_TERRAFORM}/.terraform/terraform.tfstate

terraform.workspace.setup:
	mkdir -p ./${DIR_BUILD_WORKSPACE_TERRAFORM}

	test -f ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks/target/cdk.tf.json
	cp ./${DIR_BUILD_WORKSPACE_COMPILE}/stacks/target/cdk.tf.json ./${DIR_BUILD_WORKSPACE_TERRAFORM}/cdk.tf.json

terraform.workspace.setup.verify:
	test -f ./${DIR_BUILD_WORKSPACE_TERRAFORM}/cdk.tf.json

terraform.init:
	cd ./${DIR_BUILD_WORKSPACE_TERRAFORM} && terraform init

terraform.init.upgrade:
	cd ./${DIR_BUILD_WORKSPACE_TERRAFORM} && terraform init -upgrade

terraform.stack.plan:
	cd ./${DIR_BUILD_WORKSPACE_TERRAFORM} && terraform plan -out cdk.tf.plan

terraform.stack.plan.destroy:
	cd ./${DIR_BUILD_WORKSPACE_TERRAFORM} && terraform plan -destroy -out cdk.tf.destroy

terraform.stack.apply:
	cd ./${DIR_BUILD_WORKSPACE_TERRAFORM} && terraform apply cdk.tf.plan

terraform.stack.apply.destroy:
	cd ./${DIR_BUILD_WORKSPACE_TERRAFORM} && terraform apply cdk.tf.destroy
