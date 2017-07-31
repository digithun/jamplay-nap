FROM node:8.2.1-alpine
MAINTAINER Todsaporn Banjerdkit <katopz@gmail.com>

# Use development environments
ENV NODE_ENV development

# Ref : http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
# npm 5 has bug, will use npm 4 for now... https://github.com/npm/npm/issues/17146
RUN npm i -g npm@4
RUN npm config set registry https://registry.npmjs.org/ && \
    cd /tmp && \
    npm i --quiet --depth 0 && \
    cd / && \
    # Move to app folder
    mkdir -p /usr/app && cp -a /tmp/node_modules /usr/app/
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
VOLUME ["/usr/app/.env", "/usr/app/pages", "/usr/app/components", "/usr/app/lib", "/usr/app/public", "/usr/app/graphql", "/usr/app/routes", "/usr/app/providers", "/usr/app/templates", "/usr/app/server"]

# HTTP port, default to 3000
EXPOSE ${PORT:-3000}