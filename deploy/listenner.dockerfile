# base stage: build entire solution
FROM node:14-alpine
WORKDIR /app
COPY . .
RUN yarn install

EXPOSE 3000
ENV PATH="${PATH}:./node_modules/.bin"

CMD ts-node packages/listenner/src/app.ts

