# base stage: build entire solution
FROM node:15-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
# RUN npm run clean
# RUN npm run build

EXPOSE 3000
RUN ls -l
CMD node packages/listenner/dist/app.js