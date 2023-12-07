# syntax=docker/dockerfile:1
# https://hub.docker.com/_/amazonlinux
FROM amazonlinux:2 AS build

ARG NPM_TOKEN
ARG PROJECT_DIR "/src/repository"

WORKDIR "/src/repository"

# --
# -- Box Setup
# --

RUN yum update -y
RUN yum install -y \
      which \
      make \
      zip \
      gzip \
      tar

# --
# -- Node Setup
# --

ENV NVM_VERSION "0.34.0"
ENV NVM_DIR "/usr/local/nvm"

ENV NODE_VERSION "16.17.1"
ENV NODE_PATH "${NVM_DIR}/versions/node/v${NODE_VERSION}/bin"

ENV NPM_VERSION "8.19.2"

# https://github.com/nvm-sh/nvm
RUN  mkdir -p ${NVM_DIR} \
  && curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh" | bash \
  && source "${NVM_DIR}/nvm.sh" \
  && nvm install "${NODE_VERSION}" \
  && nvm alias "default" "${NODE_VERSION}" \
  && nvm use "default" \
  && npm i -g "npm@${NPM_VERSION}" \
  && node -v \
  && npm -v

ENV PATH "${NODE_PATH}:${PATH}"

RUN  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "${PROJECT_DIR}/.npmrc" \
  && mkdir -p "${PROJECT_DIR}/service/build/vendor" \
  && cd "${PROJECT_DIR}/service/build/vendor" \
  && ln -s "../../../.npmrc"

# --
# -- Copy: Configurations
# --

COPY \
  "README.md" \
  "Makefile" \
  "package.json" \
  "package-lock.json" \
  "tsconfig.json" \
    "${PROJECT_DIR}/"

# --
# -- Copy: Client
# --

COPY \
  "client/README.md" \
  "client/Makefile" \
  "client/package.json" \
  "client/tsconfig.json" \
  "client/vitest.config.ts" \
    "${PROJECT_DIR}/client/"

COPY "client/build/tsconfig.json" "${PROJECT_DIR}/client/build/tsconfig.json"
COPY "client/src/" "${PROJECT_DIR}/client/src/"

# --
# -- Copy: Service
# --

COPY \
  "service/README.md" \
  "service/Makefile" \
  "service/package.json" \
  "service/tsconfig.json" \
  "service/vitest.config.ts" \
    "${PROJECT_DIR}/service/"

COPY "service/build/tsconfig.json" "${PROJECT_DIR}/service/build/tsconfig.json"
COPY "service/src/" "${PROJECT_DIR}/service/src/"

# --
# -- Dependencies Install
# --

RUN  cd "${PROJECT_DIR}" \
  && npm ci

# --
# -- Build Client
# --

RUN  cd "${PROJECT_DIR}/client" \
  && make compile \
  && make package

# --
# -- Build Service
# --

RUN  cd "${PROJECT_DIR}/service" \
  && make compile \
  && make certificates \
  && make glue \
  && make package \
  && make vendor

# --
# -- Export
# --

FROM scratch

ARG PROJECT_DIR

COPY --from=build "${PROJECT_DIR}/service/build/workspace/package.zip" "/data/package.zip"
COPY --from=build "${PROJECT_DIR}/service/build/workspace/package.zip.md5" "/data/package.zip.md5"

COPY --from=build "${PROJECT_DIR}/service/build/workspace/vendor.zip" "/data/vendor.zip"
COPY --from=build "${PROJECT_DIR}/service/build/workspace/vendor.zip.md5" "/data/vendor.zip.md5"

COPY --from=build "${PROJECT_DIR}/service/build/workspace/glue/jar/postgresql-driver.jar" "/data/glue/jar/postgresql-driver.jar"
COPY --from=build "${PROJECT_DIR}/service/build/workspace/glue/jar/snowflake-jdbc-driver.jar" "/data/glue/jar/snowflake-jdbc-driver.jar"
COPY --from=build "${PROJECT_DIR}/service/build/workspace/glue/jar/spark-snowflake-driver.jar" "/data/glue/jar/spark-snowflake-driver.jar"
COPY --from=build "${PROJECT_DIR}/service/build/workspace/glue/script/land-registry-data-sync.py" "/data/glue/script/land-registry-data-sync.py"
