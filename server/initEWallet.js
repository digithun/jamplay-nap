const request = require('superagent')

const wallet = {
  silver: 1000000,
  gold: 1000000,
  receipts: []
}

const init = (config, app) => {
  const api = config.e_wallet_api
  if (api === 'DEV') {
    global.NAP.EWallet = {
      getEWallet: token => ({
        hasReceipt: async ({ refId, spendType }) => !!wallet.receipts.find(r => r === refId),
        getJelly: async () => ({ gold: wallet.gold, silver: wallet.silver }),
        spendJelly: async ({ refId, spendType, merchantId, merchantAlaisId, amount, currencyType, commissionRate }) => {
          if (currencyType === 'gold') {
            wallet.gold -= amount
          } else {
            wallet.silver -= amount
          }
          wallet.receipts.push(refId)
          return { gold: wallet.gold, silver: wallet.silver }
        }
      })
    }
  } else {
    global.NAP.EWallet = {
      getEWallet: token => {
        const callApi = async (path, data = {}) => {
          const result = await request
            .post(`${api}/v1/${path}`)
            .set('Content-Type', 'application/json')
            .send(Object.assign({
              token
            }, data))
          return result.body.data
        }
        return {
          hasReceipt: async ({ refId, spendType }) => {
            const result = await callApi('spend/hasReceipt', { refId, spendType })
            return result.status
          },
          getJelly: async () => {
            const result = await callApi('user/getJelly')
            return result.reader
          },
          spendJelly: async ({ refId, spendType, merchantId, merchantAlaisId, amount, currencyType, commissionRate }) => {
            const result = await callApi('spend/spendJelly', { refId, spendType, merchantId, merchantAlaisId, amount, currencyType, commissionRate })
            return result.reader
          }
        }
      }
    }
  }
}

module.exports = init
