export $(cat .env | grep -v ^# | xargs)

ssh -t root@$DEPLOY_TARGET 'cd /root && ls && mkdir -p jamplay-nap && pm2 delete jamplay-nap && pm2 --name jamplay-nap start npm -- run _serve'