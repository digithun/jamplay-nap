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
        spendJelly: async ({ refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload }) => {
          console.log('EWallet.DEV.spendJelly: ', { refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload })
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
    const chalk = require('chalk')
    global.NAP.EWallet = {
      getEWallet: token => {
        const callApi = async (path, data = {}) => {
          console.log(chalk.yellow('Ewallet: ') + `External api call ${path}`, data)
          const result = await request
            .post(`${api}/v1/${path}`)
            .set('Content-Type', 'application/json')
            // add token to data
            .set('authorization', process.env.E_WALLET_API_KEY)
            .set('x-app-secret', process.env.E_WALLET_APP_SECRET || 'undefined')
            .timeout({
              response: 5000
            })
            .send(Object.assign({
              token
            }, data))
          return result.body.data
        }
        const callGetApi = async (path, data = {}) => {
          const result = await request
            .get(`${api}/v1/${path}`)
            .set('Content-Type', 'application/json')
            // add token to data
            .set('authorization', process.env.E_WALLET_API_KEY)
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
            try {
              const result = await callApi('user/getJelly')
              if (result.gold >= 0) { return result }
              return {gold: 0, silver: 0}
            } catch (e) {
              console.log(e)
              return {gold: 0, silver: 0}
            }
          },
          getMerchantEwallet: async () => {
            const result = await callApi('user/getMerchantEWallet')
            try {
              return result
            } catch (e) {
              return {gold: 0, silver: 0}
            }
          },
          spendJelly: async ({ refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload }) => {
            const result = await callApi('spend/spendJelly', { refId, spendType, merchantId, merchantAliasId, amount, currencyType, commissionRate, payload })
            return result
          },
          // TO DO: change schema
          addExchange: async ({ amountIn, amountOut, conversionType }) => {
            const result = await callApi('exchange/addExchange', { amountIn, amountOut, conversionType })
            return result
          },
          getRate: async ({collectionType}) => {
            const rateType = 'baht:gold'
            const result = await callApi('rate/findRateActive', { rateType, collectionType })
            return result
          },
          findExchangeByToken: async () => {
            const result = await callApi('exchange/findByToken', { token })
            return result.exchanges
          },
          findSpendByToken: async () => {
            const result = await callApi('spend/findByToken', { token })
            return result.spends
          },
          findFeeTax: async () => {
            const result = await callGetApi('config/findConfig')
            return result
          },
          createWithdraw: async ({balance, amount, fee, tax}) => {
            const result = await callApi('withdraw/addWithdraw', {token, balance, amount, fee, tax})
            return result
          },
          findWithdrawByToken: async () => {
            const result = await callApi('withdraw/findWithdrawByToken', { token })
            return result.withdraws || []
          },
          findIncomeByToken: async () => {
            const result = await callApi('spend/findIncomeByToken', { token })
            return result.income || []
          },
          findIncomeByBook: async ({ bookId }) => {
            const result = await callApi('spend/findIncomeByBook', { bookId })
            return result.income || []
          },
          addExchangeByTruemoney: async ({cashcardNO}) => {
            const result = await callApi('exchange/addExchangeByTruemoney', {cashcardNO})
            return result || []
          }
        }
      }
    }
  }
}
module.exports = init
