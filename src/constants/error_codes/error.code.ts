export enum ErrorCode {
  /** USER */
  AuthUserExists = "AUTH-001",
  AuthNicknameExists = "AUTH-002",
  AuthUserNotExists = "AUTH-003",
  /** PWD */
  PwdSignupMismatch = "PWD-001",
  PwdDbMismatch = "PWD-002",
  /** VERIFY */
  VerifyInvalidToken = "VERIFY-001",
}

export const ERROR_MESSAGE_LIST = {
  /** USER */
  [ErrorCode.AuthUserExists]: "이미 존재하는 userId",
  [ErrorCode.AuthNicknameExists]: "이미 존재하는 nickName",
  [ErrorCode.AuthUserNotExists]: "존재하지 않는 유저",
  /** PWD */
  [ErrorCode.PwdSignupMismatch]: "[회원가입] 비밀번호가 일치하지 않습니다.",
  [ErrorCode.PwdDbMismatch]: "[DB] 비밀번호가 일치하지 않습니다.",
  /** VERIFY */
  [ErrorCode.VerifyInvalidToken]: "유효하지 않은 토큰입니다.",
} as const;
