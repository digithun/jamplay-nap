const { createNetworkInterface, ApolloClient } = require('apollo-client')
const gql = require('graphql-tag')

const createApolloClient = token => {
  const networkInterface = createNetworkInterface({
    uri: process.env.INTEGRATION_TARGET
  })
  networkInterface.use([{
    applyMiddleware (req, next) {
      if (!req.options.headers) {
        req.options.headers = {}
      }
      if (token) {
        req.options.headers.authorization = `Bearer ${token}`
      }
      next()
    }
  }])
  const client = new ApolloClient({
    networkInterface
  })
  return client
}

let client = createApolloClient()

const createApolloClientWithUser = async user => {
  let result = await client.mutate({
    mutation: gql`
      mutation ($email: String!, $password: String!){
        login(email: $email, password: $password) {
          sessionToken
        }
      }
    `,
    variables: {
      email: user.email,
      password: user.password
    }
  })
  return createApolloClient(result.data.login.sessionToken)
}

module.exports.createApolloClient = createApolloClient
module.exports.createApolloClientWithUser = createApolloClientWithUser
