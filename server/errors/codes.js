const { GenericError } = require('./index.js')

module.exports = {
  // Ref: Firebase Admin Error
  // https://firebase.google.com/docs/auth/admin/errors
  get AUTH_INVALID_ARGUMENT () {
    return new GenericError(
      'auth/invalid-argument',
      'An invalid argument was provided to an Authentication method. The error message should contain additional information.'
    )
  },
  get AUTH_INVALID_DISABLED_FIELD () {
    return new GenericError('auth/invalid-disabled-field', 'The provided value for the disabled user property is invalid. It must be a boolean.')
  },
  get AUTH_INVALID_DISPLAY_NAME () {
    return new GenericError('auth/invalid-display-name', 'The provided value for the displayName user property is invalid. It must be a non-empty string.')
  },
  get AUTH_INVALID_EMAIL_VERIFIED () {
    return new GenericError('auth/invalid-email-verified', 'The provided value for the emailVerified user property is invalid. It must be a boolean.')
  },
  get AUTH_INVALID_EMAIL () {
    return new GenericError('auth/invalid-email', 'The provided value for the email user property is invalid. It must be a string email address.')
  },
  get AUTH_MISSING_EMAIL () {
    return new GenericError('auth/missing-email', 'An email is required for the current operation.')
  },
  get AUTH_INVALID_PASSWORD () {
    return new GenericError(
      'auth/invalid-password',
      'The provided value for the password user property is invalid. It must be a string with at least six characters.'
    )
  },
  get AUTH_INVALID_PHOTO_URL () {
    return new GenericError('auth/invalid-photo-url', 'The provided value for the photoURL user property is invalid. It must be a string URL.')
  },
  get AUTH_INVALID_UID () {
    return new GenericError('auth/invalid-uid', 'The provided uid must be a non-empty string with at most 128 characters.')
  },
  get AUTH_MISSING_UID () {
    return new GenericError('auth/missing-uid', 'A uid identifier is required for the current operation.')
  },
  get AUTH_UID_ALREADY_EXISTS () {
    return new GenericError('auth/uid-already-exists', 'The provided uid is already in use by an existing user. Each user must have a unique uid.')
  },
  get AUTH_EMAIL_ALREADY_EXISTS () {
    return new GenericError('auth/email-already-exists', 'The provided email is already in use by an existing user. Each user must have a unique email.')
  },
  get AUTH_USER_NOT_FOUND () {
    return new GenericError('auth/user-not-found', 'There is no existing user record corresponding to the provided identifier.')
  },
  get AUTH_OPERATION_NOT_ALLOWED () {
    return new GenericError(
      'auth/operation-not-allowed',
      'The provided sign-in provider is disabled for your NAP project. Enable it from the Sign-in Method section of the NAP console.'
    )
  },
  get AUTH_INVALID_CREDENTIAL () {
    return new GenericError(
      'auth/invalid-credential',
      'The credential used to authenticate the Admin SDKs cannot be used to perform the desired action. Certain Authentication methods such as createCustomToken() and verifyIdToken() require the SDK to be initialized with a certificate credential as opposed to a refresh token or Application Default credential. See Initialize the SDK for documentation on how to authenticate the Admin SDKs with a certificate credential.'
    )
  },
  get AUTH_PROJECT_NOT_FOUND () {
    return new GenericError(
      'auth/project-not-found',
      'No NAP project was found for the credential used to initialize the Admin SDKs. See Add NAP to your app for documentation on how to generate a credential for your project and use it to authenticate the Admin SDKs.'
    )
  },
  get AUTH_INSUFFICIENT_PERMISSION () {
    return new GenericError(
      'auth/insufficient-permission',
      'The credential used to initialize the Admin SDK has insufficient permission to access the requested Authentication resource. See Add NAP to your app for documentation on how to generate a credential with appropriate permissions and use it to authenticate the Admin SDKs.'
    )
  },
  get AUTH_INTERNAL_ERROR () {
    return new GenericError(
      'auth/internal-error',
      'The Authentication server encountered an unexpected error while trying to process the request. The error message should contain the response from the Authentication server containing additional information. If the error persists, please report the problem to our Bug Report support channel.'
    )
  },

  // Ref: Firebase Auth Error
  // https://firebase.google.com/docs/reference/node/firebase.auth.Error
  get AUTH_APP_DELETED () {
    return new GenericError('auth/app-deleted', 'The instance of NAPApp has been deleted.')
  },
  get AUTH_APP_NOT_AUTHORIZED () {
    return new GenericError(
      'auth/app-not-authorized',
      "The app identified by the domain where it's hosted, is not authorized to use NAP Authentication with the provided API key. Review your key configuration in the Google API console."
    )
  },
  get AUTH_ARGUMENT_ERROR () {
    return new GenericError('auth/argument-error', 'A method is called with incorrect arguments.')
  },
  get AUTH_INVALID_API_KEY () {
    return new GenericError('auth/invalid-api-key', 'The provided API key is invalid. Please check that you have copied it correctly from the NAP Console.')
  },
  get AUTH_INVALID_USER_TOKEN () {
    return new GenericError('auth/invalid-user-token', "The user's credential is no longer valid. The user must sign in again.")
  },
  get AUTH_NETWORK_REQUEST_FAILED () {
    return new GenericError('auth/network-request-failed', 'A network error (such as timeout, interrupted connection or unreachable host) has occurred.')
  },
  get AUTH_REQUIRES_RECENT_LOGIN () {
    return new GenericError(
      'auth/requires-recent-login',
      "The user's last sign-in time does not meet the security threshold. Use firebase.User#reauthenticateWithCredential to resolve. This does not apply if the user is anonymous."
    )
  },
  get AUTH_TOO_MANY_REQUESTS () {
    return new GenericError(
      'auth/too-many-requests',
      'Requests are blocked from a device due to unusual activity. Trying again after some delay would unblock.'
    )
  },
  get AUTH_UNAUTHORIZED_DOMAIN () {
    return new GenericError(
      'auth/unauthorized-domain',
      'The app domain is not authorized for OAuth operations for your NAP project. Edit the list of authorized domains from the NAP console.'
    )
  },
  get AUTH_USER_DISABLED () {
    return new GenericError(
      'auth/user-disabled',
      'The user account has been disabled by an administrator. Accounts can be enabled or disabled in the NAP Console, the Auth section and Users subsection.'
    )
  },
  get AUTH_USER_TOKEN_EXPIRED () {
    return new GenericError(
      'auth/user-token-expired',
      "The user's credential has expired. This could also be thrown if a user has been deleted. Prompting the user to sign in again should resolve this for either case."
    )
  },
  get AUTH_WEB_STORAGE_UNSUPPORTED () {
    return new GenericError('auth/web-storage-unsupported', 'The browser does not support web storage or if the user disables them.')
  },

  // Ref: https://firebase.google.com/docs/reference/js/firebase.auth.Auth
  get AUTH_WEAK_PASSWORD () {
    return new GenericError('auth/weak-password', 'Password must be in between 6-256 length')
  },
  get AUTH_EMAIL_ALREADY_IN_USE () {
    return new GenericError('auth/email-already-in-use', 'There is already exists an account with the given email address.')
  },
  get AUTH_WRONG_PASSWORD () {
    return new GenericError(
      'auth/wrong-password',
      'Password is invalid for the given email, or if the account corresponding to the email does not have a password set.'
    )
  },
  get AUTH_EMAIL_ALREADY_SENT () {
    return new GenericError('auth/email-already-sent', 'Email already sent.')
  },
  get AUTH_EMAIL_NOT_SENT () {
    return new GenericError('auth/email-not-sent', "Email can't be send.")
  },
  get AUTH_FACEBOOK_INVALID_TOKEN () {
    return new GenericError('auth/facebook-invalid-token', 'Invalid Facebook token.')
  },
  get AUTH_PASSPORT_FAILED () {
    return new GenericError('auth/passport-failed', "Authentication with Passport has been fail, can't resolve user data")
  },
  get AUTH_EMAIL_NOT_VERIFIED () {
    return new GenericError('auth/email-not-verified', 'Authentication with Passport has been fail, emailVerified user property is set to false.')
  },
  get AUTH_FB_EMAIL_NOT_VERIFIED () {
    return new GenericError('auth/facebook-email-not-verified', '')
  },
  // Provider
  // Ref : https://firebase.google.com/docs/reference/js/firebase.User
  get AUTH_CREDENTIAL_ALREADY_IN_USE () {
    return new GenericError(
      'auth/credential-already-in-use',
      'The account corresponding to the credential already exists among your users, or is already linked to a NAP User.'
    )
  },
  get AUTH_PROVIDER_ALREADY_LINKED () {
    return new GenericError(
      'auth/provider-already-linked',
      "The provider has already been linked to the user. This error is thrown even if this is not the same provider's account that is currently linked to the user."
    )
  },

  // Ref : https://firebase.google.com/docs/reference/js/firebase.auth.Auth
  get AUTH_INVALID_ACTION_CODE () {
    return new GenericError('auth/invalid-action-code', 'The reset code is invalid. This can happen if the code is malformed or has already been used.')
  },
  get AUTH_INVALID_LOGIN () {
    return new GenericError('auth/invalid-login', 'Provided email and/or password was invalid.')
  }
}
