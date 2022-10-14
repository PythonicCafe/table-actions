FROM node:14-alpine

USER root

WORKDIR /app

ADD package.json /app

RUN yarn

ADD ./ /app

COPY wrapper_script.sh wrapper_script.sh

RUN chown -R node node_modules/

USER node

CMD sh wrapper_script.sh
