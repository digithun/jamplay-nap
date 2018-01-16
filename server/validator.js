const { guard } = require('./errors')
const ERRORS = require('./errors/codes')

const isPasswordMatch = async (password, hashed_password) => {
  // Guard
  guard({ password })
  guard({ hashed_password })

  // Password matched?
  const bcrypt = require('bcryptjs')
  const isMatched = bcrypt.compareSync(password, hashed_password)
  if (!isMatched) {
    throw ERRORS.AUTH_WRONG_PASSWORD
  }

  return true
}

const willValidateEmail = async email => {
  const is = require('is_js')

  if (!email || email.trim() === '') {
    throw ERRORS.AUTH_INVALID_EMAIL
  }

  if (is.not.email(email)) {
    throw ERRORS.AUTH_INVALID_EMAIL
  }

  return true
}

const willValidateEmptyPassword = async password => {
  guard({ password })
  return true
}

const willValidatePassword = async password => {
  const is = require('is_js')

  guard({ password })

  if (is.not.within(password.length, 5, 256)) {
    throw ERRORS.AUTH_WEAK_PASSWORD
  }

  return true
}

const willValidateEmailAndPassword = async (email, password) => {
  let isValid = await willValidateEmail(email)
  isValid = isValid && (await willValidatePassword(password))
  return isValid
}

const willValidateEmailAndEmptyPassword = async (email, password) => {
  let isValid = await willValidateEmail(email)
  isValid = isValid && (await willValidateEmptyPassword(password))
  return isValid
}

module.exports = {
  isPasswordMatch,
  willValidateEmail,
  willValidateEmptyPassword,
  willValidateEmailAndEmptyPassword,
  willValidatePassword,
  willValidateEmailAndPassword
}
