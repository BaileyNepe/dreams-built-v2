

FROM oven/bun:1.2.8-slim as builder
WORKDIR /app

COPY ./bun.lock /app/
COPY ./package.json /app/

COPY ./apps/server/package.json /app/apps/server/
COPY ./apps/shared/package.json /app/apps/shared/
COPY ./apps/client/package.json /app/apps/client/
COPY ./apps/server/prisma/ /app/apps/server/prisma/

RUN apt update \
    && apt install -y curl


ARG NODE_VERSION=22.13

RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n $NODE_VERSION \
    && rm n \
    && npm install -g n

RUN npm rebuild argon2

RUN bun install
    
COPY . .
    
RUN bun run server:db-generate
RUN bun run server:build


FROM oven/bun:1.2.8-slim

WORKDIR /app

COPY --from=builder /app/apps/server/dist /app/apps/server/dist
COPY --from=builder /app/node_modules/.prisma /node_modules/.prisma


EXPOSE 5001

ENTRYPOINT ["bun", "apps/server/dist/server.js"]