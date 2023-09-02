import { faker } from "@faker-js/faker";

import { User, UsersSigninDto, UsersSignupDto } from "src/models/_loader";

export class UserFakeGenerator {
  async getUsersSignupDto(): Promise<UsersSignupDto> {
    const fakePassword = faker.internet.password();
    const fakeUserId = faker.random.word();
    const fakeNickame = faker.datatype.uuid();

    const fakeUsersSignupDto = new UsersSignupDto();
    fakeUsersSignupDto.userId = fakeUserId;
    fakeUsersSignupDto.nickName = fakeNickame;
    fakeUsersSignupDto.password = fakePassword;
    fakeUsersSignupDto.passwordCheck = fakePassword;

    return fakeUsersSignupDto
  };

  async getUsersSigninDto(userId?: string, password?: string): Promise<UsersSigninDto> {
    try {
      const fakeUserId = userId ? userId : "userId";
      const fakePassword = password ? password : "password";

      const fakeUsersSigninDto = new UsersSigninDto();
      fakeUsersSigninDto.userId = fakeUserId;
      fakeUsersSigninDto.password = fakePassword;

      return fakeUsersSigninDto
    } catch (err) {

      throw err;

    }
  };

  async getUserSimplePacket(): Promise<User> {
    try {
      return {
        userId: faker.random.word(),
        userNickname: faker.random.word(),
        userPassword: "$2a$10$ZT3801RsLkJzlXWxufcgB.cuAmAKr6eIXNVQ0w8rTC5UGCuIVU9Fa",
        userUuid: faker.datatype.uuid(),
        userFacebook: faker.internet.url(),
        userInstagram: faker.internet.url(),
        userTwitter: faker.internet.url()
      }
    } catch (err) {

      throw err

    }
  }
}
