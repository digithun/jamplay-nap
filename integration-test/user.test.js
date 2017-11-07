const { createNetworkInterface, ApolloClient } = require('apollo-client')
const gql = require('graphql-tag')
const createDB = require('./connections')
const common = require('./utils/common')

describe('user', () => {
  const client = common.createApolloClient()
  let db, user, clientWithUser
  beforeAll(async () => {
    db = await createDB()
    await db.content.collection('users').deleteOne({ email: "integration-test.user.signup@digithun.co.th" })
    user = await db.utils.user.create({
      email: 'integration-test.user@digithun.co.th',
      password: 'Admin1234',
      emailVerified: true,
      name: 'integration-test.user',
      first_name: 'integration_first_name',
      last_name: 'integration_last_name',
      gender: 'M'
    })
    clientWithUser = await common.createApolloClientWithUser(user)
  })
  afterAll(async () => {
    await db.utils.user.delete(user)
    await db.close()
  })
  it('should null if incorrect token', async () => {
    const result = await client.query({
      query: gql`
        {
          user {
            id
            name
          }
        }
      `
    })
    expect(result.data.user).toBeNull()
  })

  it('should not null if correct token', async () => {
    let result = await clientWithUser.query({
      query: gql`
        query {
          user {
            id
            name
            first_name
            last_name
            hasPassword
            ewallet {
              gold
              silver
            }
            merchantEwallet {
              silver
              gold
              accumulate
            }
          }
        }
      `
    })
    const duser = result.data.user
    expect(duser).toBeDefined()
    expect(duser.ewallet.silver).toBe(15)
    expect(duser.ewallet.gold).toBe(0)
    expect(duser.name).toBe(user.name)
    expect(duser.first_name).toBe(user.first_name)
    expect(duser.last_name).toBe(user.last_name)
    expect(duser.hasPassword).toBe(true)
  })

  it('should signup and login success', async () => {
    let result = await client.mutate({
      mutation: gql`
        mutation {
          signup(record: {
            email: "integration-test.user.signup@digithun.co.th",
            password: "Admin1234",
            confirmPassword: "Admin1234",
            name: "integration-test.user.signup",
            first_name: "integration-test.user.signup",
            last_name: "integration-test.user.signup",
            birthday: "${(new Date(0)).toISOString()}",
            gender: M
          }) {
            id
          }
        }
      `
    })
    expect(result.data.signup.id).toBeDefined()
    await db.content.collection('users').findOneAndUpdate({ email: "integration-test.user.signup@digithun.co.th" }, { $set: { emailVerified: true } })
    let client2 = await common.createApolloClientWithUser({
      email: "integration-test.user.signup@digithun.co.th",
      password: "Admin1234"
    })
    result = await client2.query({
      query: gql`
        query {
          user {
            id
          }
        }
      `
    })
    expect(result.data.user).toBeDefined()
  })
})
 