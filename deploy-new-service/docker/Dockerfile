FROM node:12-alpine

RUN apk update && apk add --no-cache nmap openssh && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      git \
      nss

WORKDIR /src

COPY package.json ./
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]