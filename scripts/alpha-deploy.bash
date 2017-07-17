export $(cat .env | grep -v ^# | xargs)
echo 'Deploy Jamplay to $DEPLOY_TARGET'
yarn _build
rm -rf ./dist
mkdir -p dist
tar --exclude='.git' --exclude='.env' --exclude='./dist/artifact.tar' --exclude='./node_modules' --exclude='./.vscode' -czf ./dist/artifact.tar ./
rsync -avz ./dist/artifact.tar root@$DEPLOY_TARGET:/root/jamplay-nap.tar
ssh -t root@$DEPLOY_TARGET 'cd /root && ls && mkdir -p jamplay-nap  && tar -xvf jamplay-nap.tar -C /root/jamplay-nap && cd jamplay-nap && yarn install'


