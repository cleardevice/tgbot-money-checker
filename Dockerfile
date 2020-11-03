FROM node:15.0.1
WORKDIR /bot
COPY ./bot/package.json /bot
COPY ./bot/yarn.lock /bot
RUN yarn
COPY ./bot /bot
CMD node index.js
