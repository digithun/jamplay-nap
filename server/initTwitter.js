const { getOAuthRequestToken, getAccessToken } = require('../sharer/twitterHelper')
const Twitter = require('twitter')
const chalk = require('chalk')

// Init
const init = ({ twitter_consumer_key, twitter_consumer_secret }, app) => {
  const consumerKey = twitter_consumer_key
  const consumerSecret = twitter_consumer_secret

  if (!consumerKey || !consumerSecret) {
    console.warn(chalk.bgYellow('TWITTER consumerSecret not found! Therefore TWITTER feature will not work'))
    return
  }

  // EXPRESS
  app.get('/twitter/request_token', async (req, res) => {
    try {
      let { oauth_callback } = req.query
      oauth_callback = Buffer.from(oauth_callback, 'base64').toString('utf8')
      console.log(oauth_callback)
      let result = await getOAuthRequestToken({ consumerKey, consumerSecret, oauth_callback })
      res.send(JSON.stringify(result)) // send back url to login twitter
    } catch (error) {
      console.log('/twitter/request_token error', { error })
      res.status(500).send(error.toString())
    }
  })

  // TWITTER hook callback
  app.get('/twitter/access_token', async (req, res) => {
    try {
      console.log('/twitter/access_token query', req.query)

      const { oauth_token, oauth_verifier, oauth_token_secret } = req.query

      let result = await getAccessToken({ oauth_token, oauth_token_secret, oauth_verifier, consumerKey, consumerSecret })
      res.send(JSON.stringify(result))
    } catch (error) {
      console.log('/twitter/access_token error', { error })
      res.status(500).send(error.toString())
    }
  })

  app.post('/twitter/post', (req, res) => {
    try {
      const { accessToken, status } = req.body
      console.log('/twitter/post ', req.body)
      const tokenSplit = accessToken.split('_')
      const oauth_access_token = tokenSplit[0]
      const oauth_access_token_secret = tokenSplit[1]

      const client = new Twitter({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        access_token_key: oauth_access_token,
        access_token_secret: oauth_access_token_secret
      })

      client.post('statuses/update', { status }, (error, tweet, response) => {
        if (error) {
          console.log({ error })
          return res.status(500).send(JSON.stringify({ error }))
        }

        res.send(JSON.stringify({ tweet }))
        // console.log(tweet);  // Tweet body.
        // console.log(response);  // Raw response object.
      })
    } catch (error) {
      res.status(500).send(error.toString())
    }
  })
}
module.exports = init
