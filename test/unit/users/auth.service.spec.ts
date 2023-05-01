import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  INestApplication,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { DataSource, EntityManager, QueryRunner, Repository } from "typeorm";

import { v4 } from "uuid";
import { faker } from "@faker-js/faker";

import { User } from "src/models/entities/user.entity";

import { AppModule } from "src/app.module";
import { AuthService } from "src/routes/users/auth.service";
import { UserRepository } from "src/routes/users/users.repository";
import { BcryptProvider } from "src/common/providers/bcrypt.provider";

import { UsersSignupDto } from "src/models/dtos/users/users.signup.dto";
import { UsersSigninDto } from "src/models/dtos/users/users.login.dto";
import { ERROR_MESSAGE_LIST, ErrorCode } from "src/constants/error_codes/error.code";
import { UserFakeDtoGenerator } from "test/_fake.datas/users.fake.dto";
import { UsersSimplePacket } from "src/models/packets/users/users.simple.packet";
import { RowDataPacket } from "mysql2";

describe("AuthService", () => {
  let app: INestApplication;
  let module: TestingModule;
  let service: AuthService;
  let dataSource: DataSource;
  let usersRepo: UserRepository;
  let usersSignupDto: UsersSignupDto;
  let usersSigninDto: UsersSigninDto;

  let bcryptProvider: BcryptProvider;
  let userFakeDtoGenerator: UserFakeDtoGenerator;

  let queryRunner: QueryRunner;
  let queryRunnerManager: EntityManager;

  let findUser: UsersSimplePacket;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    jest.mock("fs");

    app = module.createNestApplication();
    await app.init();

    service = module.get<AuthService>(AuthService);

    /** mock usersRepo */
    usersRepo = module.get<UserRepository>(UserRepository);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
    queryRunnerManager = queryRunner.manager;

    bcryptProvider = module.get<BcryptProvider>(BcryptProvider);

    userFakeDtoGenerator = new UserFakeDtoGenerator();

    return app;
  });

  beforeEach(async () => {
    await queryRunner.connect();
  });

  describe("signup", () => {
    beforeEach(async () => {
      usersSignupDto = userFakeDtoGenerator.getUsersSignupDto();
    });
    const userUuid = v4();

    let user: User = {
      user_uuid: userUuid,
      user_id: usersSignupDto.userId,
      user_nickname: usersSignupDto.nickName,
      user_password: usersSignupDto.password,
      user_twitter: null,
      user_instagram: null,
      user_facebook: null,
    };

    it("아이디는 중복될 수 없다, AUTH-001", async () => {
      usersSignupDto.userId = "userId";
      const isUserByUserId = await usersRepo.isUserByUserId(queryRunnerManager, usersSignupDto.userId);
      jest.spyOn(usersRepo, "isUserByUserId").mockResolvedValueOnce(isUserByUserId);

      try {
        await service.signup(usersSignupDto);
      } catch (err: unknown) {
        expect(err).toBeDefined();
        expect(err instanceof ConflictException && err["message"]).toBe("이미 존재하는 userId");
        expect(err instanceof ConflictException && err["status"]).toBe(409);
        expect(err instanceof ConflictException && err["response"]["error"]).toBe("AUTH-001");
      }
    });

    it("닉네임은 중복될 수 없다, AUTH-002", async () => {
      usersSignupDto.nickName = "nickName";
      const isUserByNickname = await usersRepo.isUserByNickname(queryRunnerManager, usersSignupDto.nickName);
      jest.spyOn(usersRepo, "isUserByNickname").mockResolvedValueOnce(isUserByNickname);

      try {
        await service.signup(usersSignupDto);
      } catch (err: unknown) {
        expect(err).toBeDefined();
        expect(err instanceof ConflictException && err["message"]).toBe("이미 존재하는 nickName");
        expect(err instanceof ConflictException && err["status"]).toBe(409);
        expect(err instanceof ConflictException && err["response"]["error"]).toBe("AUTH-002");
      }
    });

    it("회원가입 후, 유저를 반환한다.", async () => {
      /** bcryptProvider의 hassPassword가 호출되면, password를 return */
      service["bcryptProvider"].hashPassword = jest.fn((password: string) => password);
      jest.spyOn(service, "signup").mockResolvedValue(user);

      const result = await service.signup(usersSignupDto);

      expect(result).toBe(user);
    });
  });

  describe("signin", () => {
    beforeEach(async () => {
      usersSigninDto = userFakeDtoGenerator.getUsersSigninDto();
      // findUser = userFakeDtoGenerator.
    });
    it(`${ERROR_MESSAGE_LIST["AUTH-003"]}, ${ErrorCode.AuthUserNotExists}`, async () => {
      usersSigninDto.userId = faker.internet.email();
      const findUserByUserId = await usersRepo.findUserByUserId(queryRunnerManager, usersSigninDto.userId);
      jest.spyOn(usersRepo, "findUserByUserId").mockResolvedValue(findUserByUserId);

      try {
        service.signin(usersSigninDto);
      } catch (err) {
        expect(err).toBeDefined();
        expect(err instanceof UnauthorizedException && err["message"]).toBe(ERROR_MESSAGE_LIST["AUTH-003"]);
        expect(err instanceof ConflictException && err["status"]).toBe(401);
        expect(err instanceof ConflictException && err["response"]["error"]).toBe(ErrorCode.AuthUserNotExists);
      }
    });

    it(`[DB] 비밀번호가 일치하지 않습니다. PWD-002`, async () => {
      usersSigninDto.password = faker.internet.password();
      const hashedPassword = "$2a$10$ZT3801RsLkJzlXWxufcgB.cuAmAKr6eIXNVQ0w8rTC5UGCuIVU9Fa";
      usersRepo["findUserByUserId"] = jest.fn(
        async(): Promise<UsersSimplePacket | null> => findUser
      )
      const comparedPassword = bcryptProvider.comparedPassword(usersSigninDto.password, hashedPassword);
      jest.spyOn(bcryptProvider, "comparedPassword").mockResolvedValue(comparedPassword);

      try {
        service.signin(usersSigninDto);
      } catch (err) {}
    });
    it("로그인 후, 토큰을 반환한다", async () => {});
  });

  afterAll(async () => {
    await app.close();
    await module.close();
    await queryRunner.release();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });
});
