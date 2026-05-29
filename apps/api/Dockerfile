# Build args available to all stages
ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

# Stage: build assets
FROM node:26-alpine AS build
ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

RUN test -n "$BUILD_NUMBER" || (echo "BUILD_NUMBER not set" && false)
RUN test -n "$GIT_REF" || (echo "GIT_REF not set" && false)
RUN test -n "$GIT_BRANCH" || (echo "GIT_BRANCH not set" && false)

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

RUN NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false npm ci
ENV NODE_ENV='production'
COPY apps/api ./apps/api
RUN npm run build -w apps/api
RUN npm prune --no-audit --no-fund --omit=dev

# Stage: copy production assets and dependencies
FROM node:26-alpine
ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

# Match the workspace structure so workspace.config.js resolves correctly at runtime:
#   process.cwd() = /app/apps/frontend  →  NODE_MODULES = /app/node_modules
WORKDIR /app/apps/api
COPY --from=build --chown=node:node \
        /app/apps/api/package.json \
        ./
COPY --from=build --chown=node:node \
        /app/apps/api/dist \
        ./dist

# node_modules lives at the repo-root level (/app/node_modules) to mirror
# how npm workspaces hoists dependencies — and so workspace.config.js finds them.
COPY --from=build --chown=node:node \
        /app/node_modules \
        /app/node_modules

EXPOSE 3001
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV GIT_REF=${GIT_REF}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV NODE_ENV='production'
USER node
CMD [ "node", "dist/server.js" ]