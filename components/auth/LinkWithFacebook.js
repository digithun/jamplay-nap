import React from 'react'
import { gql, graphql, compose } from 'react-apollo'
import persist from '../../lib/persist'
import userProfile from '../userProfile.gql'
import PropTypes from 'prop-types'

class LinkWithFacebook extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      accessToken: ''
    }
    this.linkWithFacebook = props.linkWithFacebook
  }

  handleChange (event) {
    this.setState({ accessToken: event.target.value })
  }

  handleSubmit (e) {
    e.preventDefault()

    const accessToken = e.target.elements.accessToken.value

    if (accessToken === '') {
      window.alert('All fields are required.')
      return false
    }

    this.linkWithFacebook(accessToken)

    // reset form
    e.target.elements.accessToken.value = ''
  }

  componentDidMount () {
    if (this.isComponentDidMount) return
    this.isComponentDidMount = true

    persist.willGetAccessToken().then(accessToken => this.isComponentDidMount && accessToken && this.setState({ accessToken }))
  }

  componentWillUnmount () {
    this.isComponentDidMount = false
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <h1>Link (GraphQL) with Facebook accessToken</h1>
        <input placeholder='accessToken' name='accessToken' value={this.state.accessToken} onChange={this.handleChange.bind(this)} />
        <button type='submit'>Link</button>
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

const linkWithFacebook = gql`
mutation linkWithFacebook($accessToken: String!) {
  linkWithFacebook(accessToken: $accessToken) {
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

LinkWithFacebook.propTypes = () => ({
  linkWithFacebook: PropTypes.func.isRequired
})

const withGraphQL = graphql(linkWithFacebook, {
  props: ({ mutate }) => ({
    linkWithFacebook: accessToken =>
      mutate({
        variables: { accessToken },
        update: (proxy, { data }) => {
          // Guard
          const { errors } = data
          if (errors) {
            window.alert(errors[0].message)
            return
          }

          // Read the data from our cache for this query.
          let cached = proxy.readQuery({ query: userProfile })

          // Errors
          cached.errors = errors

          // User
          cached.user = data.linkWithFacebook

          // Write our data back to the cache.
          proxy.writeQuery({ query: userProfile, data: cached })
        }
      })
  })
})

export default compose(withGraphQL)(LinkWithFacebook)
