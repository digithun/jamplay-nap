const result = {}
let startGet = false

const getModel = (name) => {
  if (result[name]) {
    return result[name]
  }
  result[name] = require(`./${name}`)()
  return result[name]
}

module.exports = () => Object.assign(
   getModel('User'),
   getModel('Installation'),
   getModel('Authen'),
   getModel('Error')
)

module.exports.getModel = getModel