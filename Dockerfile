FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install tini
RUN apk add --no-cache tini

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY ./src/ ./
COPY ./config/config.yaml /config/config.yaml

ENV NODE_ENV=production

CMD ["/sbin/tini", "--", "node", "server.js", "/config/config.yaml"]
