FROM node:9-alpine
WORKDIR /app
VOLUME /app/persist

ENV NODE_ENV=production
ADD package.json .
ADD package-lock.json .
RUN npm install

ADD . .
CMD ["npm", "start"]
