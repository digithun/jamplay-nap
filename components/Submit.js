import { gql, graphql } from 'react-apollo'
import NAPClient from '../lib/NAPClient'
import React from 'react'

const Submit = ({ loginWithFacebook }) => {
  const handleSubmit = (e) => {
    e.preventDefault()

    let deviceInfo = e.target.elements.deviceInfo.value
    let accessToken = e.target.elements.accessToken.value

    if (deviceInfo === '' || accessToken === '') {
      window.alert('Both fields are required.')
      return false
    }

    loginWithFacebook(deviceInfo, accessToken)

    // reset form
    e.target.elements.deviceInfo.value = ''
    e.target.elements.accessToken.value = ''
  }

  if (!NAPClient.sessionToken) {
    return (
      <form onSubmit={handleSubmit}>
        <h1>LogIn</h1>
        <input placeholder='deviceInfo' name='deviceInfo' defaultValue='foo' />
        <input placeholder='accessToken' name='accessToken' defaultValue='EAABnTrZBSJyYBAKvcWAcAOUwt07ZCVxhCYQwKKWFZAwtOhsGYZAc7olL04W8eJTlxBeZCmxCQO9kYZA4kKtTD0zmZChhb5hEoZBl7JHT0Rx39uGP8ow2X9vGoTLFZCm4Dd0NFvH0qsHXNYinsOKjszfSJVOj3DZChv0MNszawr1le8O0ToqI3Ak9Jr8X3X6imEtvJ2q8ceeVh5Ux1rSbgypRQNRDjlredVXpIZD' />
        <button type='submit'>LogIn</button>
        <style jsx>{`
        form {
          border-bottom: 1px solid #ececec;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 20px;
        }
        input {
          display: block;
          margin-bottom: 10px;
        }
      `}</style>
      </form>
    )
  } else {
    return (
      <div>Hi</div>
    )
  }
}

const loginWithFacebook = gql`
mutation loginWithFacebook($deviceInfo: String!, $accessToken: String!) {
  loginWithFacebook(deviceInfo: $deviceInfo, accessToken: $accessToken) {
    sessionToken
    user {
      _id
      name
    }
  }
  errors {
    code
    message
  }
}
`

Submit.propTypes = () => ({
  loginWithFacebook: React.PropTypes.func.isRequired
})

export default graphql(loginWithFacebook, {
  props: ({ mutate }) => ({
    loginWithFacebook: (deviceInfo, accessToken) => mutate({
      variables: { deviceInfo, accessToken },
      updateQueries: {
        userProfile: (previousResult, { mutationResult }) => {
          // Keep session
          NAPClient.sessionToken = mutationResult.data.loginWithFacebook.sessionToken

          // Provide user
          return mutationResult.data.loginWithFacebook
        }
      }
    })
  })
})(Submit)
