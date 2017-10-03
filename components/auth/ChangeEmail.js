import React from 'react'
import PropTypes from 'prop-types'
import { gql, graphql } from 'react-apollo'
import userProfile from '../userProfile.gql'

const ChangeEmail = ({ changeEmail }) => {
  const handleSubmit = e => {
    e.preventDefault()
    let email = e.target.elements.email.value

    if (email === '') {
      window.alert('Email fields are required.')
      return false
    }

    changeEmail(email)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Change Email (GraphQL)</h1>
      <input placeholder='email' name='email' defaultValue='katopz+1@gmail.com' />
      <button type='submit'>ChangeEmail</button>
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

const changeEmail = gql`
mutation changeEmail($email: String!) {
  changeEmail(email: $email) {
    status
  }
  errors {
    code
    message
  }
}
`

ChangeEmail.propTypes = () => ({
  changeEmail: PropTypes.func.isRequired
})

export default graphql(changeEmail, {
  props: ({ mutate }) => ({
    changeEmail: email =>
      mutate({
        variables: { email },
        update: (proxy, { data }) => {
          // Read the data from our cache for this query.
          let cached = proxy.readQuery({ query: userProfile })

          // Errors
          cached.errors = data.errors

          // User
          cached.user = cached.user || {
            _id: null,
            name: null,
            status: null,
            isLinkedWithFacebook: null,
            __typename: 'User'
          }
          cached.user.status = data.changeEmail.status

          // Write our data back to the cache.
          proxy.writeQuery({ query: userProfile, data: cached })
        }
      }).catch(err => {
        window.alert(err.message)
      })
  })
})(ChangeEmail)
