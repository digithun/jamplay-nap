export $(cat .env | grep -v ^# | xargs)
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')
echo 'Start build image with project id: ' $(gcloud config get-value project), tag: $PACKAGE_VERSION

echo 'Branch' $BRANCH
if [ "$BRANCH" == "master" ]; then
docker build -t gcr.io/$(gcloud config get-value project)/jamplay-nap:$PACKAGE_VERSION --rm -f jamplay.Dockerfile .
docker tag gcr.io/$(gcloud config get-value project)/jamplay-nap:$PACKAGE_VERSION gcr.io/$(gcloud config get-value project)/jamplay-nap:latest
else
docker build -t gcr.io/$(gcloud config get-value project)/jamplay-nap:latest --rm -f jamplay.Dockerfile .
fi
