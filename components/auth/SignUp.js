import React from 'react'
import { gql, graphql } from 'react-apollo'
import userProfile from '../userProfile.gql'
import PropTypes from 'prop-types'

const SignUp = ({ signUpWithEmailAndPassword }) => {
  const handleSubmit = e => {
    e.preventDefault()

    let email = e.target.elements.email.value
    let password = e.target.elements.password.value

    if (email === '' || password === '') {
      window.alert('Both fields are required.')
      return false
    }

    signUpWithEmailAndPassword(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>SignUp (GraphQL)</h1>
      <input placeholder='email' name='email' defaultValue='katopz@gmail.com' />
      <input placeholder='password' name='password' defaultValue='foobar' />
      <button type='submit'>SignUp</button>
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

const signUpWithEmailAndPassword = gql`
mutation signUpWithEmailAndPassword($email: String!, $password: String!) {
  signUpWithEmailAndPassword(email: $email, password: $password) {
    _id
    name
    status
    isLinkedWithFacebook
  }
  errors {
    code
    message
  }
}
`

SignUp.propTypes = () => ({
  signUpWithEmailAndPassword: PropTypes.func.isRequired
})

export default graphql(signUpWithEmailAndPassword, {
  props: ({ mutate }) => ({
    signUpWithEmailAndPassword: (email, password) =>
      mutate({
        variables: { email, password },
        update: (proxy, { data }) => {
          // Read the data from our cache for this query.
          let cached = proxy.readQuery({ query: userProfile })

          // Errors
          cached.errors = data.errors

          // User
          cached.user = data.signUpWithEmailAndPassword
            ? data.signUpWithEmailAndPassword
            : {
              _id: null,
              name: null,
              status: null,
              isLinkedWithFacebook: null,
              __typename: 'User'
            }

          // Write our data back to the cache.
          proxy.writeQuery({ query: userProfile, data: cached })
        }
      }).catch(err => {
        window.alert(err.message)
      })
  })
})(SignUp)
