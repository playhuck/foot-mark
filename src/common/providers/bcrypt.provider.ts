import bcryptjs from "bcryptjs";
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
    } catch (e) {

      throw e;
      
    }
  }

  public async matchedPassword(password: string, passwordCheck: string): Promise<boolean> {
    return password === passwordCheck ? true : false;
  }
}
