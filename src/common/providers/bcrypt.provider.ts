import bcrypt from "bcryptjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BcryptProvider {
  public hashPassword(inputPassword: string): string {
    return bcrypt.hashSync(inputPassword, 10);
  }

  public async comparedPassword(inputPassword: string, existPassword: string): Promise<boolean> {
    return await bcrypt.compare(inputPassword, existPassword);
  }

  public async matchedPassword(password: string, passwordCheck: string): Promise<boolean> {
    return password === passwordCheck ? true : false;
  }
}
