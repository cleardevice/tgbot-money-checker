FROM node:15.0.1
WORKDIR /bot
COPY ./bot /bot
RUN cd /bot && yarn
CMD node index.js
