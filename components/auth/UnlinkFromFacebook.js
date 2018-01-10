import React from 'react'
import { gql, graphql, compose } from 'react-apollo'
import userProfile from '../userProfile.gql'
import PropTypes from 'prop-types'

class UnlinkFromFacebook extends React.Component {
  constructor (props) {
    super(props)

    this.unlinkFromFacebook = props.unlinkFromFacebook
  }

  handleSubmit (e) {
    e.preventDefault()
    this.unlinkFromFacebook()
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <h1>Unlink with Facebook</h1>
        <p>You're linked with Facebook</p>
        <button type='submit'>Unlink</button>
        <style jsx>{`
        form {
          border-bottom: 1px solid #ececec;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 20px;
        }
      `}</style>
      </form>
    )
  }
}

const unlinkFromFacebook = gql`
mutation unlinkFromFacebook {
  unlinkFromFacebook {
    _id
    name
    status
    isLinkedWithFacebook
  }
}
`

UnlinkFromFacebook.propTypes = () => ({
  unlinkFromFacebook: PropTypes.func.isRequired
})

const withGraphQL = graphql(unlinkFromFacebook, {
  props: ({ mutate }) => ({
    unlinkFromFacebook: accessToken =>
      mutate({
        variables: { accessToken },
        update: (proxy, { data }) => {
          // Read the data from our cache for this query.
          let cached = proxy.readQuery({ query: userProfile })

          // User
          cached.user = data.unlinkFromFacebook

          // Write our data back to the cache.
          proxy.writeQuery({ query: userProfile, data: cached })
        }
      }).catch(err => {
        window.alert(err.message)
      })
  })
})

export default compose(withGraphQL)(UnlinkFromFacebook)
