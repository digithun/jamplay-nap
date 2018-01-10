import React from 'react'
import { gql, graphql, compose } from 'react-apollo'
import persist from '../../lib/persist'
import device from '../../lib/device'
import userProfile from '../userProfile.gql'
import PropTypes from 'prop-types'

class SignUpWithFacebookAndEmail extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      accessToken: '',
      deviceInfo: '',
      email: 'katopz+1@gmail.com'
    }
    this.signUpWithFacebookAndEmail = props.signUpWithFacebookAndEmail
  }

  handleChange (event) {
    this.setState({ accessToken: event.target.value })
  }

  handleEmailChange (event) {
    this.setState({ email: event.target.value })
  }

  handleSubmit (e) {
    e.preventDefault()

    const deviceInfo = e.target.elements.deviceInfo.value
    const accessToken = e.target.elements.accessToken.value
    const email = e.target.elements.email.value

    if (deviceInfo === '' || accessToken === '' || email === '') {
      window.alert('All fields are required.')
      return false
    }

    this.signUpWithFacebookAndEmail(deviceInfo, accessToken, email)
  }

  componentDidMount () {
    if (this.isComponentDidMount) return
    this.isComponentDidMount = true

    persist.willGetAccessToken().then(accessToken => this.isComponentDidMount && accessToken && this.setState({ accessToken }))
    this.setState({ deviceInfo: device.info() })
  }

  componentWillUnmount () {
    this.isComponentDidMount = false
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <h1>Signup with Facebook accessToken and email</h1>
        <input placeholder='deviceInfo' name='deviceInfo' value={this.state.deviceInfo} />
        <input placeholder='accessToken' name='accessToken' value={this.state.accessToken} onChange={this.handleChange.bind(this)} />
        <input placeholder='email' name='email' value={this.state.email} onChange={this.handleEmailChange.bind(this)} />
        <button type='submit'>Login</button>
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
  }
}

const signUpWithFacebookAndEmail = gql`
mutation signUpWithFacebookAndEmail($deviceInfo: String!, $accessToken: String!, $email: String!) {
  signUpWithFacebookAndEmail(deviceInfo: $deviceInfo, accessToken: $accessToken, email: $email) {
    isLoggedIn
    sessionToken
    user {
      _id
      name
      status
      isLinkedWithFacebook
    }
  }
}
`

SignUpWithFacebookAndEmail.propTypes = () => ({
  signUpWithFacebookAndEmail: PropTypes.func.isRequired
})

const withGraphQL = graphql(signUpWithFacebookAndEmail, {
  props: ({ mutate }) => ({
    signUpWithFacebookAndEmail: (deviceInfo, accessToken, email) =>
      mutate({
        variables: { deviceInfo, accessToken, email },
        update: (proxy, { data }) => {
          // Keep session
          persist.willSetSessionToken(data.signUpWithFacebookAndEmail.sessionToken)

          // Read the data from our cache for this query.
          let cached = proxy.readQuery({ query: userProfile })

          // User
          cached.user = data.signUpWithFacebookAndEmail.user

          // Authen
          cached.authen = {
            isLoggedIn: data.signUpWithFacebookAndEmail.isLoggedIn,
            sessionToken: data.signUpWithFacebookAndEmail.sessionToken,
            __typename: 'Authen'
          }

          // Write our data back to the cache.
          proxy.writeQuery({ query: userProfile, data: cached })
        }
      }).catch(err => {
        window.alert(err.message)
      })
  })
})

export default compose(withGraphQL)(SignUpWithFacebookAndEmail)
