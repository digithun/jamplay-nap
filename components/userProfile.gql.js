import { gql } from 'react-apollo'
export default gql`
query userProfile {
  authen {
    isLoggedIn
  }
  user {
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
