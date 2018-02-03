FROM node:8.9.1-alpine
RUN apk add vips-dev=8.6.1-r0 fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
