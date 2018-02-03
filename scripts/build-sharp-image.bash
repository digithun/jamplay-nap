echo 'Start build node-sharp image'
# Ref : http://sharp.dimens.io/en/}stable/install/#alpine-linux
docker build -t gcr.io/$(gcloud config get-value project)/node-sharp:latest --rm -f node-sharp.Dockerfile .
