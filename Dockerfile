FROM node:10-alpine
WORKDIR /app
VOLUME /app/persist

ENV NODE_ENV=production
ADD package.json .
ADD package-lock.json .
RUN npm ci

ADD . .
CMD ["npm", "start"]
