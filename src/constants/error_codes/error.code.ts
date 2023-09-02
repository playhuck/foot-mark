export enum ErrorCode {
  /** USER */
  AuthUserExists = "AUTH-001",
  AuthNicknameExists = "AUTH-002",
  AuthUserNotExists = "AUTH-003",
  AuthSignInGetToken = "AUTH-004",
  /** PWD */
  PwdSignupMismatch = "PWD-001",
  PwdDbMismatch = "PWD-002",
  /** VERIFY */
  VerifyInvalidToken = "VERIFY-001",
  VerifyInvalidJwtEnv = "VERIFY-002"
}

export const ERROR_MESSAGE_LIST = {
  /** USER */
  [ErrorCode.AuthUserExists]: "이미 존재하는 userId",
  [ErrorCode.AuthNicknameExists]: "이미 존재하는 nickName",
  [ErrorCode.AuthUserNotExists]: "존재하지 않는 유저",
  [ErrorCode.AuthSignInGetToken]: "로그인 후 토큰 획득",
  /** PWD */
  [ErrorCode.PwdSignupMismatch]: "[회원가입] 비밀번호가 일치하지 않습니다.",
  [ErrorCode.PwdDbMismatch]: "[DB] 비밀번호가 일치하지 않습니다.",
  /** VERIFY */
  [ErrorCode.VerifyInvalidJwtEnv]: "유효하지 않은 JWT 환경변수가 있습니다",
  [ErrorCode.VerifyInvalidToken]: "유효하지 않은 토큰입니다.",
} as const;
