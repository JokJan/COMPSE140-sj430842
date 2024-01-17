FROM node:21.5.0-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json package.json
COPY package-lock.json package-lock.json

# Use npm clean install to ensure the build is always the same
RUN npm ci --omit=dev

COPY . .

EXPOSE 8083

CMD node index.js
