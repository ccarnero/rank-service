FROM node:15-alpine AS rank-puller-builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run clean
RUN npm run build

# Our Second stage, that creates an image for production
FROM node:15-alpine AS rank-dblistenner-prod
WORKDIR /app
COPY --from=rank-puller-builder ./app/dist ./dist
COPY package* ./
RUN npm install --production
CMD npm start