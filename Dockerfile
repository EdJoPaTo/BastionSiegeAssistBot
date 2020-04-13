FROM node:12-alpine
WORKDIR /build

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY source source
RUN node_modules/.bin/tsc

RUN rm -rf node_modules && \
  npm ci --production && \
  npm i source-map-support


FROM node:12-alpine
WORKDIR /app
VOLUME /app/persist
VOLUME /app/tmp

RUN apk --no-cache add fontconfig font-noto && \
  fc-cache -f

ENV NODE_ENV=production
ENV NODE_ICU_DATA="node_modules/full-icu"

COPY --from=0 /build/node_modules ./node_modules
COPY locales locales
COPY --from=0 /build/dist ./

CMD node -r source-map-support/register index.js
