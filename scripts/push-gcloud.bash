export $(cat .env | grep -v ^# | xargs)
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo 'Start push image with project id: ' $(gcloud config get-value project), tag: latest
gcloud docker -- push gcr.io/$(gcloud config get-value project)/jamplay-nap:latest
if [ "$BRANCH" == "master" ]; then
echo 'Start push image with project id: ' $(gcloud config get-value project), tag: $PACKAGE_VERSION
gcloud docker -- push gcr.io/$(gcloud config get-value project)/jamplay-nap:$PACKAGE_VERSION
fi
