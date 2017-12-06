FROM node:8.9.1-alpine as builder
MAINTAINER Todsaporn Banjerdkit <katopz@gmail.com>

# Ref : http://sharp.dimens.io/en/}stable/install/#alpine-linux
RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
# Ref : https://github.com/imagemin/n/issues/72
# Ref : https://github.com/imagemin/pngquant-bin/issues/36
RUN apk add --update-cache bash build-base nasm autoconf

WORKDIR /usr/app
ENV NODE_ENV production

COPY package*.json ./
COPY graphql/content/package*.json ./graphql/content/
COPY graphql/content/lib/validator/package*.json ./graphql/content/lib/validator/
RUN npm config set registry https://registry.npmjs.org/ && \
  npm i --production --depth 0 --unsafe-perm && \
  npm i --production -g --quiet --depth 0 modclean && \
  modclean -r -D ./node_modules && \
  modclean -r -D ./graphql/content/node_modules && \
  modclean -r -D ./graphql/content/lib/validator/node_modules && \
  npm r -g --quiet modclean && du -ms .

FROM node:8.9-alpine
ENV NODE_ENV production
RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
WORKDIR /usr/app
COPY --from=builder /usr/app .
ENV NODE_ENV production
COPY . .

CMD ["npm", "run", "_serve"]

EXPOSE ${PORT:-3000} ${LOG_PORT:-3001
