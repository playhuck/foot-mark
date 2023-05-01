import { IsString, IsNotEmpty } from 'class-validator';

export class UsersSigninDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
