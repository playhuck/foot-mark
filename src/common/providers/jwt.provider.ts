import jwt from "jsonwebtoken";
import { Injectable, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { TALGORITHM } from "src/constants/types/t.algorithm";

declare module "jsonwebtoken" {
  export type CustomTokenType = "AccessToken" | "AppTesterToken";

  export interface ICustomPayload extends jwt.JwtPayload {
    type: CustomTokenType;
  }

  export interface IAccessTokenPayload extends ICustomPayload {
    type: "AccessToken";
    hostUuid: string;
  }
}

@Injectable()
export class JwtProvider {
  static isInit = false;
  static JWT_ACCESS_EXPIRED_IN: string;

  static JWT_PRIVATE_PEM_KEY: string;
  static JWT_PUBLIC_PEM_KEY: string;
  static JWT_PASSPHRASE: string;
  static JWT_ALGOIRHTM: TALGORITHM;

  public signAccessToken(payload: jwt.IAccessTokenPayload): string {
    try {
      return jwt.sign(
        payload,
        {
          key: JwtProvider.JWT_PRIVATE_PEM_KEY,
          passphrase: JwtProvider.JWT_PASSPHRASE,
        },
        {
          expiresIn: JwtProvider.JWT_ACCESS_EXPIRED_IN,
          algorithm: "RS256",
        },
      );
    } catch (err) {
      throw new InternalServerErrorException("JWT SIGN ERROR", "JWT SIGN ERROR");
    }
  }

  public extractToken(bearerToken: string): string {
    return bearerToken.substring(7);
  }
}
