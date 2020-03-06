# Build Phase
FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY package.json .
RUN yarn
COPY . .
RUN yarn build

# Execution Phase
FROM node:alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json .
RUN yarn

# PM2 Setup
RUN npm install pm2 -g
COPY pm2.config.js .

# Source code setup
COPY --from=builder /usr/src/app/dist .
COPY public.pem .
COPY private.pem .
COPY .env .

CMD [ "pm2-runtime", "pm2.config.js"]
