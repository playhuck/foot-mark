import { IsString, IsNotEmpty } from 'class-validator';
import { BadRequestException } from "@nestjs/common";

export class UsersSignupDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  nickName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordCheck: string;
}
