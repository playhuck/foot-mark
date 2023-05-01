import { faker } from "@faker-js/faker";
import { v4 } from "uuid";

import { UsersSigninDto, UsersSignupDto } from "src/models/_loader";

export class UserFakeDtoGenerator {
  getUsersSignupDto(): UsersSignupDto {
    const fakePassword = faker.internet.password();
    const fakeUserId = faker.datatype.uuid();
    const fakeNickame = faker.datatype.uuid();
    const fakeUserUuid = v4();

    const fakeUsersSignupDto = new UsersSignupDto();
    fakeUsersSignupDto.userId = fakeUserId;
    fakeUsersSignupDto.nickName = fakeNickame;
    fakeUsersSignupDto.password = fakePassword;
    fakeUsersSignupDto.passwordCheck = fakePassword;

    return fakeUsersSignupDto
  };

  getUsersSigninDto(userId? : string, password? : string): UsersSigninDto {
    const fakeUserId = userId ? userId : "userId";
    const fakePassword = password ? password : "password"

    const fakeUsersSigninDto = new UsersSigninDto();
    fakeUsersSigninDto.userId = fakeUserId;
    fakeUsersSigninDto.password = fakePassword;

    return fakeUsersSigninDto
  }
}
