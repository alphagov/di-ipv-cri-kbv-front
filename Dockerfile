FROM node:18.7.0-alpine3.15@sha256:633d16172e5184d1dd01a041581c2759ae3d59f0dd192bd322890bcc765c28cb AS builder

WORKDIR /app

COPY .yarn ./.yarn
COPY package.json yarn.lock .yarnrc.yml ./
COPY /src ./src

RUN yarn install
RUN yarn build

# 'yarn install --production' does not prune test packages which are necessary
# to build the app. So delete nod_modules and reinstall only production packages.
RUN [ "rm", "-rf", "node_modules" ]
RUN yarn install --production --frozen-lockfile

FROM node:18.7.0-alpine3.15@sha256:633d16172e5184d1dd01a041581c2759ae3d59f0dd192bd322890bcc765c28cb AS final

RUN ["apk", "--no-cache", "upgrade"]
RUN ["apk", "add", "--no-cache", "tini"]

WORKDIR /app

# Copy in compile assets and deps from build container
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/src ./src


ENV PORT 8080
EXPOSE $PORT

ENTRYPOINT ["tini", "--"]

CMD ["yarn", "start"]
