import { UserPoolOperation } from '@aws-cdk/aws-cognito';

export const TriggerOpMap = {
  createAuthChallenge: UserPoolOperation.CREATE_AUTH_CHALLENGE,
  customMessage: UserPoolOperation.CUSTOM_MESSAGE,
  defineAuthChallenge: UserPoolOperation.DEFINE_AUTH_CHALLENGE,
  postAuthentication: UserPoolOperation.POST_AUTHENTICATION,
  postConfirmation: UserPoolOperation.POST_CONFIRMATION,
  preAuthentication: UserPoolOperation.PRE_AUTHENTICATION,
  preSignUp: UserPoolOperation.PRE_SIGN_UP,
  preTokenGeneration: UserPoolOperation.PRE_TOKEN_GENERATION,
  userMigration: UserPoolOperation.USER_MIGRATION,
  verifyAuthChallengeResponse: UserPoolOperation.VERIFY_AUTH_CHALLENGE_RESPONSE,
};
