# base stage: build entire solution
FROM node:15-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
RUN npm run clean
RUN npm run build

CMD node packages/listenner/dist/app.js