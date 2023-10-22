FROM node:18.18.2-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json package.json
COPY package-lock.json package-lock.json

# Use npm clean install to ensure the build is always the same
RUN npm ci --omit=dev

COPY . .

EXPOSE 8087

CMD node index.js
