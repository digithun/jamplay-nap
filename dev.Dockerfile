FROM node:8.7.0-alpine
MAINTAINER Todsaporn Banjerdkit <katopz@gmail.com>

# Use development environments
ENV NODE_ENV development

# Ref : https://github.com/mhart/alpine-node#example-dockerfile-for-your-own-nodejs-project
# Ref : http://sharp.dimens.io/en/stable/install/#alpine-linux
# Ref : http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
RUN apk add make gcc g++ python vips-dev fftw-dev --no-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/ && \
  npm config set registry https://registry.npmjs.org/ && \
  cd /tmp && \
  npm i --depth 0 --update-binary --no-shrinkwrap && \
  cd / && \
  npm i --production -g --quiet --depth 0 modclean && \
  modclean -r -D /tmp/node_modules && \
  npm r -g --quiet modclean && du -ms . && \
  mkdir -p /usr/app && cp -a /tmp/node_modules /usr/app/ && \
  rm -rf /tmp && \
  apk del make gcc g++ python
WORKDIR /usr/app

# Plugins
RUN mkdir -p /usr/app/providers && \
  mkdir -p /usr/app/templates && \
  mkdir -p /usr/app/server

COPY providers /usr/app/providers
COPY templates /usr/app/templates
COPY server /usr/app/server
COPY package.json /usr/app/
COPY index.js /usr/app/
COPY nodemon.json /usr/app/

# Make volume path
VOLUME ["/usr/app/.env", "/usr/app/pages", "/usr/app/components", "/usr/app/lib", "/usr/app/public", "/usr/app/graphql", "/usr/app/routes", "/usr/app/providers", "/usr/app/templates", "/usr/app/server", "/usr/app/notification"]

# HTTP port, default to 3000
EXPOSE ${PORT:-3000}