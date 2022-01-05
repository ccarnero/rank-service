# base stage: build entire solution
FROM node:15-alpine
WORKDIR /app
COPY . .
RUN yarn install

EXPOSE 3000
ENV PATH="${PATH}:./node_modules/.bin"

CMD nodemon --exec "ts-node packages/ranker/src/app.ts"

