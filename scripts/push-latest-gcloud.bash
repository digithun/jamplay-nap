docker tag digithun/jamplay-nap gcr.io/$(gcloud config get-value project)/jamplay-nap:latest
gcloud docker -- push gcr.io/$(gcloud config get-value project)/jamplay-nap:latest