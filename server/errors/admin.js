const { GenericError } = require('../errors.js')

module.exports = {
  // Ref: Firebase Auth Error
  // https://firebase.google.com/docs/auth/admin/errors
  AUTH_INVALID_ARGUMENT: new GenericError('auth/invalid-argument', 'An invalid argument was provided to an Authentication method. The error message should contain additional information.'),
  AUTH_INVALID_DISABLED_FIELD: new GenericError('auth/invalid-disabled-field', 'The provided value for the disabled user property is invalid. It must be a boolean.'),
  AUTH_INVALID_DISPLAY_NAME: new GenericError('auth/invalid-display-name', 'The provided value for the displayName user property is invalid. It must be a non-empty string.'),
  AUTH_INVALID_EMAIL_VERIFIED: new GenericError('auth/invalid-email-verified', 'The provided value for the emailVerified user property is invalid. It must be a boolean.'),
  AUTH_INVALID_EMAIL: new GenericError('auth/invalid-email', 'The provided value for the email user property is invalid. It must be a string email address.'),
  AUTH_INVALID_PASSWORD: new GenericError('auth/invalid-password', 'The provided value for the password user property is invalid. It must be a string with at least six characters.'),
  AUTH_INVALID_PHOTO_URL: new GenericError('auth/invalid-photo-url', 'The provided value for the photoURL user property is invalid. It must be a string URL.'),
  AUTH_INVALID_UID: new GenericError('auth/invalid-uid', 'The provided uid must be a non-empty string with at most 128 characters.'),
  AUTH_MISSING_UID: new GenericError('auth/missing-uid', 'A uid identifier is required for the current operation.'),
  AUTH_UID_ALREAD_EXISTS: new GenericError('auth/uid-alread-exists', 'The provided uid is already in use by an existing user. Each user must have a unique uid.'),
  AUTH_EMAIL_ALREADY_EXISTS: new GenericError('auth/email-already-exists', 'The provided email is already in use by an existing user. Each user must have a unique email.'),
  AUTH_USER_NOT_FOUND: new GenericError('auth/user-not-found', 'There is no existing user record corresponding to the provided identifier.'),
  AUTH_OPERATION_NOT_ALLOWED: new GenericError('auth/operation-not-allowed', 'The provided sign-in provider is disabled for your Firebase project. Enable it from the Sign-in Method section of the Firebase console.'),
  AUTH_INVALID_CREDENTIAL: new GenericError('auth/invalid-credential', 'The credential used to authenticate the Admin SDKs cannot be used to perform the desired action. Certain Authentication methods such as createCustomToken() and verifyIdToken() require the SDK to be initialized with a certificate credential as opposed to a refresh token or Application Default credential. See Initialize the SDK for documentation on how to authenticate the Admin SDKs with a certificate credential.'),
  AUTH_PROJECT_NOT_FOUND: new GenericError('auth/project-not-found', 'No Firebase project was found for the credential used to initialize the Admin SDKs. See Add Firebase to your app for documentation on how to generate a credential for your project and use it to authenticate the Admin SDKs.'),
  AUTH_INSUFFICIENT_PERMISSION: new GenericError('auth/insufficient-permission', 'The credential used to initialize the Admin SDK has insufficient permission to access the requested Authentication resource. See Add Firebase to your app for documentation on how to generate a credential with appropriate permissions and use it to authenticate the Admin SDKs.'),
  AUTH_INTERNAL_ERROR: new GenericError('auth/internal-error', 'The Authentication server encountered an unexpected error while trying to process the request. The error message should contain the response from the Authentication server containing additional information. If the error persists, please report the problem to our Bug Report support channel.'),

  // Ref: Firebase Auth Error
  // https://firebase.google.com/docs/reference/node/firebase.auth.Error
  AUTH_APP_DELETED: new GenericError('auth/app-deleted', "Thrown if the instance of FirebaseApp has been deleted."),
  AUTH_APP_NOT_AUTHORIZED: new GenericError('auth/app-not-authorized', "Thrown if the app identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console."),
  AUTH_ARGUMENT_ERROR: new GenericError('auth/argument-error', "Thrown if a method is called with incorrect arguments."),
  AUTH_INVALID_API_KEY: new GenericError('auth/invalid-api-key', "Thrown if the provided API key is invalid. Please check that you have copied it correctly from the Firebase Console."),
  AUTH_INVALID_USER_TOKEN: new GenericError('auth/invalid-user-token', "Thrown if the user's credential is no longer valid. The user must sign in again."),
  AUTH_NETWORK_REQUEST_FAILED: new GenericError('auth/network-request-failed', "Thrown if a network error (such as timeout, interrupted connection or unreachable host) has occurred."),
  AUTH_OPERATION_NOT_ALLOWED: new GenericError('auth/operation-not-allowed', "Thrown if you have not enabled the provider in the Firebase Console. Go to the Firebase Console for your project, in the Auth section and the Sign in Method tab and configure the provider."),
  AUTH_REQUIRES_RECENT_LOGIN: new GenericError('auth/requires-recent-login', "Thrown if the user's last sign-in time does not meet the security threshold. Use firebase.User#reauthenticateWithCredential to resolve. This does not apply if the user is anonymous."),
  AUTH_TOO_MANY_REQUESTS: new GenericError('auth/too-many-requests', "Thrown if requests are blocked from a device due to unusual activity. Trying again after some delay would unblock."),
  AUTH_UNAUTHORIZED_DOMAIN: new GenericError('auth/unauthorized-domain', "Thrown if the app domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console."),
  AUTH_USER_DISABLED: new GenericError('auth/user-disabled', "Thrown if the user account has been disabled by an administrator. Accounts can be enabled or disabled in the Firebase Console, the Auth section and Users subsection."),
  AUTH_USER_TOKEN_EXPIRED: new GenericError('auth/user-token-expired', "Thrown if the user's credential has expired. This could also be thrown if a user has been deleted. Prompting the user to sign in again should resolve this for either case."),
  AUTH_WEB_STORAGE_UNSUPPORTED: new GenericError('auth/web-storage-unsupported', "Thrown if the browser does not support web storage or if the user disables them."),

  // commons
}
