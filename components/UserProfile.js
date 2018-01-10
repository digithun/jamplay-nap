import { graphql } from 'react-apollo'
import React from 'react'
import LoginWithFacebook from '../components/auth/LoginWithFacebook'
import LinkWithFacebook from '../components/auth/LinkWithFacebook'
import UnlinkFromFacebook from '../components/auth/UnlinkFromFacebook'
import SignUp from '../components/auth/SignUp'
import SignUpWithFacebookAndEmail from '../components/auth/SignUpWithFacebookAndEmail'
import Login from '../components/auth/Login'
import Logout from '../components/auth/Logout'
import Forget from '../components/auth/Forget'
import ChangeEmail from '../components/auth/ChangeEmail'
import userProfile from './userProfile.gql'
import PropTypes from 'prop-types'

const UserProfile = ({ loading, user, error, authen }) => {
  if (loading) {
    return <div>Loading<hr /></div>
  }

  // Logged in
  if (authen && authen.isLoggedIn) {
    if (user && user._id) {
      const actions = user.isLinkedWithFacebook ? <UnlinkFromFacebook /> : <LinkWithFacebook />
      return (
        <div>
          Welcome : {user.name}<Logout /><hr />
          {actions}<hr />
          <ChangeEmail />
        </div>
      )
    }
  }

  // Not logged in
  let info = error ? error.message : ''
  if (user) {
    switch (user.status) {
      case 'WAIT_FOR_NEW_EMAIL_VERIFICATION':
      case 'WAIT_FOR_EMAIL_VERIFICATION':
      case 'WAIT_FOR_EMAIL_RESET':
        info = 'Please check you email'
        break
    }
  }
  return (
    <div>
      <p className='error'>{info}</p>
      <SignUpWithFacebookAndEmail /><hr />
      <LoginWithFacebook /><hr />
      <SignUp /><hr />
      <Login /><hr />
      <Forget />
      <style jsx>{`
      .error {
        color: #ff0000
      }
      `}</style>
    </div>
  )
}

UserProfile.propTypes = () => ({
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  error: PropTypes.array.isRequired,
  authen: PropTypes.object.isRequired
})

export default graphql(userProfile, {
  options: { fetchPolicy: 'cache-and-network' },
  props: ({ data: { loading, user, error, authen } }) => ({ loading, user, error, authen })
})(UserProfile)
