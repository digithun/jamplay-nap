#!/bin/bash 
killjobs() {
    for x in $(jobs | awk -F '[][]' '{print $2}' ) ; do 
        kill %$x
    done
}
trap killjobs EXIT

kubectl port-forward --namespace=staging staging-core-mongodb-0 27017:27017 &
kubectl port-forward --namespace=staging $(kubectl get pod --namespace staging | awk '{if(NR>1) print $1}' | grep 'ewallet-[^decrypt]') 3004:3004