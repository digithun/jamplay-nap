const request = require('superagent')

const wallet = {
  silver: 0,
  gold: 0,
  receipts: []
}

const init = (config, app) => {
  const api = config.e_wallet_api
  if (api === 'DEV') {
    global.NAP.EWallet = {
      getEWallet: token => ({
        hasReceipt: async ({ refId, spendType }) => !!wallet.receipts.find(r => r === refId),
        getJelly: async () => ({ gold: wallet.gold, silver: wallet.silver }),
        spendJelly: async ({ refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate }) => {
          console.log('EWallet.DEV.spendJelly: ', { refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate })
          if (currencyType === 'gold') {
            wallet.gold -= amount
          } else {
            wallet.silver -= amount
          }
          wallet.receipts.push(refId)
          return { gold: wallet.gold, silver: wallet.silver}
        }
        // addExchange: async () =>({token, amountIn, amountOut, conversionType, progressBarcode, status})
      })
    }
  } else {
    global.NAP.EWallet = {
      getEWallet: token => {
        const callApi = async (path, data = {}) => {
          const result = await request
            .post(`${api}/v1/${path}`)
            .set('Content-Type', 'application/json')
            // add token to data
            .set('authorization', process.env.E_WALLET_APIKEY)
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
          hasCard: async ({ token }) => {
            const result = await callApi('creditcard/hasCard', { token })
            return result
          },
          deleteCard: async ({ token }) => {
            const result = await callApi('creditcard/deleteCard', { token })
            return result
          },
          getJelly: async () => {
            const result = await callApi('user/getJelly')

            if (result.gold >= 0) { return result }

            return {gold: 0, silver: 0}
          },
          spendJelly: async ({ refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate }) => {
            const result = await callApi('spend/spendJelly', { refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate })
            return result
          },
          // TO DO: change schema
          addExchange: async ({ amountIn, amountOut, conversionType }) => {
            const result = await callApi('exchange/addExchange', { amountIn, amountOut, conversionType })
            return result
          },
          getRateTable: async () => {
            const rateType = 'baht:gold'
            const result = await callApi('rate/findRateActive', { rateType })
            return result
          },
          createRateTable: async ({ keyValue }) => {
            const result = await callApi('rate/createRate', { keyValue })
            return result
          },
          findExchangeByToken: async ({ token }) => {
            const result = await callApi('exchange/findByToken', { token })
            return result.exchanges
          },
          findSpendByToken: async ({ token }) => {
            const result = await callApi('spend/findByToken', { token })
            return result.spends
          }
        }
      }
    }
  }
}

module.exports = init
