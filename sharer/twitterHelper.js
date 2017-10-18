'use strict'
const { OAuth } = require('oauth')

module.exports.getOAuthRequestToken = ({ consumerKey, consumerSecret, oauth_callback = undefined, force_login = false }) => new Promise((resolve, reject) => {
   let oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      consumerKey,
      consumerSecret,
      '1.0A',
      null,
      'HMAC-SHA1'
   )

   oauth.getOAuthRequestToken({ oauth_callback }, (error, oauth_token, oauth_token_secret, results) => {
      if (error) {
         reject(error)
         return
      }

      const url = `https://api.twitter.com/oauth/authenticate?force_login=${force_login.toString()};oauth_token=${oauth_token}`;
      resolve({ url, oauth_token, oauth_token_secret })
   })
})

module.exports.getAccessToken = ({ oauth_token, oauth_token_secret, oauth_verifier, consumerKey, consumerSecret }) => new Promise((resolve, reject) => {
   let oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      consumerKey,
      consumerSecret,
      '1.0A',
      null,
      'HMAC-SHA1'
   )

   oauth.getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier, (error, oauth_access_token, oauth_access_token_secret) => {
      if (error) {
         reject(error)
         return
      }

      resolve({
         oauth_access_token: oauth_access_token,
         oauth_access_token_secret: oauth_access_token_secret,
      })
   })
})