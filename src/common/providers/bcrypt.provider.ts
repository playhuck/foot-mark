import * as bcryptjs from "bcryptjs";
import { Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class BcryptProvider {
  public hashPassword(inputPassword: string): string {
    const hashedPassword = bcryptjs.hashSync(inputPassword, 10);
    return hashedPassword;
  }

  public async comparedPassword(inputPassword: string, existPassword: string): Promise<boolean> {
    try {
      return await bcryptjs.compare(inputPassword, existPassword);
    } catch (err) {
      throw new BadRequestException("비밀번호가 일치하지 않습니다.", "PWD-002");
    }
  }

  public async matchedPassword(password: string, passwordCheck: string): Promise<boolean> {
    return password === passwordCheck ? true : false;
  }
}
