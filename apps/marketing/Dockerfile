# syntax=docker.io/docker/dockerfile:1.4

###################################################################################
# This Dockerfile is used to produce a minial production executable image for the #
# Code.org marketing app.                                                         #
###################################################################################

# See: docker/frontend/base/Dockerfile
FROM ghcr.io/code-dot-org/frontend-base:latest AS base

##############################################################################
# Source Code Layer                                                          #
#                                                                            #
# Takes the `frontend` monorepo and prunes any apps or packages that are not #
# needed for the target docker image.                                        #
#                                                                            #
# This generates a partial monorepo removing unneeded packages and apps.     #
#                                                                            #
# Input: The base operating system                                           #
# Output: The pruned partial monorepo for the target app                     #
##############################################################################

FROM base AS source-code

WORKDIR /app

COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# See: https://turbo.build/repo/docs/reference/prune
RUN yarn dlx turbo prune @code-dot-org/marketing --docker

##############################################################################
# Builder Layer                                                              #
#                                                                            #
# Builds the partial `frontend` monorepo for the target application          #
#                                                                            #
# Inputs: The base operating system and pruned `frontend` monorepo           #
# Output: The built version of the target application                        #
##############################################################################

FROM base AS builder

# Enable Turborepo
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

ARG TURBO_API
ENV TURBO_API=$TURBO_API

# Git SHA passed from CI, surfaced to both the server process and client bundle as NEXT_PUBLIC_SENTRY_RELEASE.
# Used by Sentry.init(release: ...) to tag events with the release so Sentry's UI can group/track per-deploy.
# Safe to bake into the image — non-secret, matches the same value sentry-cli uses when uploading source maps.
ARG GIT_SHA
ENV NEXT_PUBLIC_SENTRY_RELEASE=$GIT_SHA

# Enable corepack
RUN corepack enable

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --link --from=source-code /app/out/json/ .
RUN yarn install

# Build the project. The build output is pristine — Sentry debug-ID injection and source-map upload happen
# later in the deploy workflow's S3 sync step (see .github/workflows/marketing-app-deploy-to-environment.yml).
COPY --link --from=source-code /app/out/full/ .
RUN yarn turbo run build

##############################################################################
# Runnner Layer                                                              #
#                                                                            #
# Runtime execution options for the application                              #
# Note: the source code is not included in the final image                   #
#                                                                            #
# Inputs: The base operating system and built version of the target app      #
# Output: Rootless execution env for the target app with minimal artifacts   #
##############################################################################

FROM base AS runner
WORKDIR /app

# When deploying Next.js behind a downstream proxy (e.g. a load-balancer like AWS ELB/ALB), it's important to configure
# Next's underlying HTTP server with keep-alive timeouts that are larger than the downstream proxy's timeouts.
# Otherwise, once a keep-alive timeout is reached for a given TCP connection, Node.js will immediately terminate that
# connection without notifying the downstream proxy. This results in a proxy error whenever it attempts to reuse a
# connection that Node.js has already terminated.
# See: https://nextjs.org/docs/app/api-reference/cli/next#configuring-a-timeout-for-downstream-proxies
ENV KEEP_ALIVE_TIMEOUT 70000

# Enable Node's native source-map support so server-side stack traces (SSR crashes, API routes, server actions)
# are unminified before they reach Sentry. The .map files next to each compiled .js file are read on demand.
ENV NODE_OPTIONS=--enable-source-maps

# Re-declare for the runner stage so the server process sees NEXT_PUBLIC_SENTRY_RELEASE at runtime. (Build-stage
# ENVs don't propagate across FROM boundaries.) Also causes Next.js to inline the value into any build-time
# references, but since SentryLoader reads via window.__ENV the runtime value is authoritative on the client too.
ARG GIT_SHA
ENV NEXT_PUBLIC_SENTRY_RELEASE=$GIT_SHA

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --link --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/standalone ./
COPY --link --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/static ./apps/marketing/.next/static

CMD ["node", "apps/marketing/server.js"]
