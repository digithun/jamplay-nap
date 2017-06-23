const request = require('superagent')

const wallet = {
  silver: 1000000,
  gold: 1000000,
  receipts: []
}

const init = (config, app) => {
  global.NAP.EWallet = {
    getEWallet: token => ({
      hasReceipt: async ({ refId, spendType }) => !!wallet.receipts.find(r => r === refId),
      getCoin: async () => ({ gold: wallet.gold, silver: wallet.silver }),
      spendCoin: async ({ refId, spendType, merchantId, merchantAlaisId, amount, currencyType, commissionRate }) => {
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
}

module.exports = init
