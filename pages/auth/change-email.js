import React from 'react'
import Router from 'next/router'
import 'isomorphic-fetch'
import PropTypes from 'prop-types'

const changeEmail = (token, password) =>
  fetch('/change-email-by-token', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
    headers: new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    })
  }).then(response => response.json())

class Reset extends React.Component {
  static getInitialProps ({ query: { token } }) {
    return { token }
  }

  handleSubmit = e => {
    e.preventDefault()
    const token = e.target.elements.token.value
    const password = e.target.elements.password.value

    if (token === '' || password === '') {
      window.alert('Both fields are required.')
      return false
    }

    changeEmail(token, password)
      .then(json => {
        if (json.errors) {
          return alert(json.errors[0])
        }

        if (json.data.succeed) {
          return Router.push('/auth/change-email-succeed')
        }
      })
      .catch(err => console.error(err)) // eslint-disable-line
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <h1>Change email</h1>
        <p>This field is for debug only</p>
        <input placeholder='token' name='token' defaultValue={this.props.token} /><br />
        <p>Please enter your password</p>
        <input placeholder='Your Password' name='password' type='password' />
        <button type='submit'>Submit</button>
        <style jsx>{`
      form {
        border-bottom: 1px solid #ececec
        padding-bottom: 20px
        margin-bottom: 20px
      }
      h1 {
        font-size: 20px
      }
      input {
        display: block
        margin-bottom: 10px
      }
      `}</style>
      </form>
    )
  }
}

Reset.propTypes = () => ({
  changeEmail: PropTypes.func.isRequired
})

export default Reset
