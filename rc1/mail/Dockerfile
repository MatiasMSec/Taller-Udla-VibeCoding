FROM node:24.18.1-bookworm-slim@sha256:235600a8101ab264e117b1768e925532262668dc9b581ef1dd7d96ced463b8e7

WORKDIR /app
COPY package.json ./
COPY src ./src
USER node
EXPOSE 8025
CMD ["node", "src/index.js"]
