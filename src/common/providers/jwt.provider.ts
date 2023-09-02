import jwt from "jsonwebtoken";
import fs from 'fs';
import path from 'path';
import { Injectable, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { TALGORITHM } from "src/constants/types/t.algorithm";
import { ConfigService } from "@nestjs/config";
import { ERROR_MESSAGE_LIST, ErrorCode } from "src/constants/error_codes/error.code";

declare module "jsonwebtoken" {
  export type CustomTokenType = "AccessToken" | "AppTesterToken";

  export interface ICustomPayload extends jwt.JwtPayload {
    type: CustomTokenType;
  }

  export interface IAccessTokenPayload extends ICustomPayload {
    type: "AccessToken";
    userUuid: string;
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

  constructor(configService: ConfigService) {

    JwtProvider.JWT_PRIVATE_PEM_KEY = fs.readFileSync(
      path.join(__dirname, '../../../secrets/jwt.private.pem'), 'utf8');
    JwtProvider.JWT_PUBLIC_PEM_KEY = fs.readFileSync(
      path.join(__dirname, '../../../secrets/jwt.public.pem'), 'utf8');
    JwtProvider.JWT_ACCESS_EXPIRED_IN = configService.get<string>("JWT_ACCESS_EXPIRED_IN");
    JwtProvider.JWT_ALGOIRHTM = "RS256";
    JwtProvider.JWT_PASSPHRASE = configService.get<string>("JWT_PASSPHRASE");
  }

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

      throw new InternalServerErrorException(ERROR_MESSAGE_LIST["VERIFY-002"], ErrorCode.VerifyInvalidJwtEnv);

    }
  }

  public extractToken(bearerToken: string): string {
    return bearerToken.substring(7);
  }
}
