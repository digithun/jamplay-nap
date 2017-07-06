const { GraphQLEnumType } = require('graphql')
const GenderType = new GraphQLEnumType({
  name: 'Gender',
  values: {
    M: { value: 'M' },
    F: { value: 'F' }
  }
})

module.exports = GenderType
