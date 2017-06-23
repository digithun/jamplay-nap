
export $(cat .env | grep -v ^# | xargs)

ssh -t root@$DEPLOY_TARGET 'pm2 logs jamplay-nap --lines 100'