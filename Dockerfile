FROM node:12-alpine
WORKDIR /app
VOLUME /app/persist
VOLUME /app/tmp

RUN apk --no-cache add fontconfig font-noto && \
  fc-cache -f

ENV NODE_ENV=production
ADD package.json package-lock.json ./
RUN npm ci

COPY locales locales
COPY source ./
CMD node index.js
