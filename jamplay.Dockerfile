FROM node:8.9.1
MAINTAINER Todsaporn Banjerdkit <katopz@gmail.com>

WORKDIR /usr/src/app
ENV NODE_ENV production

COPY package*.json ./
COPY graphql/content/package*.json ./graphql/content/
COPY graphql/content/lib/validator/package*.json ./graphql/content/lib/validator/
RUN npm install --only=production
COPY . .

# Ref : https://github.com/mhart/alpine-node#example-dockerfile-for-your-own-nodejs-project
# Ref : http://sharp.dimens.io/en/stable/install/#alpine-linux
# Ref : http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
# RUN apk add make gcc g++ python vips-dev fftw-dev nasm autoconf --no-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/

# COPY package*.json /tmp/
# COPY graphql/content/package.json /tmp/graphql/content/package.json
# COPY graphql/content/lib/validator/package.json /tmp/graphql/content/lib/validator/package.json
# RUN npm config set registry https://registry.npmjs.org/ && \
#   cd /tmp && \
#   npm i --production --quiet --depth 0 --no-shrinkwrap --unsafe-perm && \
#   cd / && \
#   npm i --production -g --quiet --depth 0 modclean && \
#   modclean -r -D /tmp/node_modules && \
#   npm r -g --quiet modclean && du -ms . && \
#   mkdir -p /usr/app && cp -a /tmp/node_modules /usr/app/ && \
#   mkdir -p /usr/app/logs && \
#   rm -rf /tmp && \
#   apk del make gcc g++ python
# WORKDIR /usr/app

# Plugins
# COPY . /usr/app/

# HTTP port, default to 3000

CMD ["npm", "run", "_serve"]

EXPOSE ${PORT:-3000} ${LOG_PORT:-3001}