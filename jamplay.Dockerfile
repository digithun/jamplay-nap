FROM gcr.io/jamplay-prod/node-sharp:latest as builder
# Ref : https://github.com/imagemin/n/issues/72
# Ref : https://github.com/imagemin/pngquant-bin/issues/36
RUN apk add --update-cache bash build-base nasm autoconf

WORKDIR /usr/app
ENV NODE_ENV production

COPY package*.json ./
COPY graphql/content/package*.json ./graphql/content/
COPY graphql/content/lib/validator/package*.json ./graphql/content/lib/validator/

RUN npm config set registry https://registry.npmjs.org/
RUN npm i --production --depth 0 --unsafe-perm
RUN npm i --production -g --quiet --depth 0 modclean
RUN modclean -r -D ./node_modules
RUN modclean -r -D ./graphql/content/node_modules
RUN modclean -r -D ./graphql/content/lib/validator/node_modules
RUN npm r -g --quiet modclean && du -ms .

FROM gcr.io/jamplay-prod/node-sharp:latest
ENV NODE_ENV production
WORKDIR /usr/app
COPY --from=builder /usr/app .
ENV NODE_ENV production
COPY . .

CMD ["npm", "run", "_serve"]

EXPOSE ${PORT:-3000} ${LOG_PORT:-3001
