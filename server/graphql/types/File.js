const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt } = require('graphql')
const { InputTypeComposer } = require('graphql-compose')
const InputType = new InputTypeComposer(
    new GraphQLInputObjectType({
      name: 'File',
      fields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: new GraphQLNonNull(GraphQLString) },
        size: { type: new GraphQLNonNull(GraphQLInt) },
        path: { type: new GraphQLNonNull(GraphQLString) },
      },
    })
)

module.exports = {
  inputType: InputType,
}