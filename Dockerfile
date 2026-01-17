FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY .env .env
COPY .env.test .env.test

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

EXPOSE 5000

CMD ["node", "dist/main"]
