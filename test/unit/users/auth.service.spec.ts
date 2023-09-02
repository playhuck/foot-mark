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
import { UserFakeGenerator } from "../../_fake.datas/users.fake";
import { async } from "rxjs";
import { JwtProvider } from "src/common/providers/jwt.provider";

describe("AuthService", () => {
  let app: INestApplication;
  let module: TestingModule;
  let service: AuthService;

  let user: User;
  let usersRepo: UserRepository;
  let usersSignupDto: UsersSignupDto;
  let usersSigninDto: UsersSigninDto;

  let bcryptProvider: BcryptProvider;
  let userFakeGenerator: UserFakeGenerator;

  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let queryRunnerManager: EntityManager;

  let findUser: User;

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

    userFakeGenerator = new UserFakeGenerator();

    return app;
  });

  beforeAll(async () => {
    await queryRunner.connect();
  });

  describe("signup", () => {
    beforeEach(async () => {
      usersSignupDto = await userFakeGenerator.getUsersSignupDto();
      const userUuid = v4();
      user = {
        userUuid,
        userId: usersSignupDto.userId,
        userNickname: usersSignupDto.nickName,
        userPassword: usersSignupDto.password,
        userTwitter: null,
        userInstagram: null,
        userFacebook: null,
      };
    });

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
      try {

        usersSigninDto = await userFakeGenerator.getUsersSigninDto();

      } catch (err) {

        throw err;

      }
    });
    it(`${ERROR_MESSAGE_LIST["AUTH-003"]}, ${ErrorCode.AuthUserNotExists}`, async () => {
      usersSigninDto.userId = faker.random.word();
      const findUserByUserId = await usersRepo.findUserByUserId(usersSigninDto.userId);
      jest.spyOn(usersRepo, "findUserByUserId").mockResolvedValue(findUserByUserId);

      try {
        await service.signin(usersSigninDto);
      } catch (err) {
        expect(err).toBeDefined();
        expect(err instanceof UnauthorizedException && err["message"]).toBe(ERROR_MESSAGE_LIST["AUTH-003"]);
        expect(err instanceof UnauthorizedException && err["status"]).toBe(401);
        expect(err instanceof UnauthorizedException && err["response"]["error"]).toBe(ErrorCode.AuthUserNotExists);
      }
    });

    it(`${ERROR_MESSAGE_LIST["PWD-002"]}`, async () => {
      findUser = await userFakeGenerator.getUserSimplePacket()
      usersSigninDto.password = faker.internet.password();
      jest.spyOn(usersRepo, "findUserByUserId").mockReturnValue(Promise.resolve(findUser));
      
      try {
        
        await service.signin(usersSigninDto);
      } catch (err) {
        
        expect(err).toBeDefined();
        expect(err instanceof UnauthorizedException && err["message"]).toBe(ERROR_MESSAGE_LIST["PWD-002"]);
        expect(err instanceof UnauthorizedException && err["status"]).toBe(401);
        expect(err instanceof UnauthorizedException && err["response"]["error"]).toBe(ErrorCode.PwdDbMismatch);

      }
    });

    it(`${ERROR_MESSAGE_LIST["VERIFY-002"]}`, async () => {

      try {

        JwtProvider.JWT_ACCESS_EXPIRED_IN = null;
        
        await service.signin(usersSigninDto);

      } catch (err) {

        expect(err).toBeDefined();
        expect(err instanceof InternalServerErrorException && err['message']).toBe(ERROR_MESSAGE_LIST["VERIFY-002"]);
        expect(err instanceof InternalServerErrorException && err['status']).toBe(500);
        expect(err instanceof InternalServerErrorException && err["response"]["error"]).toBe(ErrorCode.VerifyInvalidJwtEnv);

        JwtProvider.JWT_ACCESS_EXPIRED_IN = "12h";

      }
    })

    it(`${ERROR_MESSAGE_LIST["AUTH-004"]}`, async () => {

      try {
        const result = await service.signin(usersSigninDto);
        
        expect(result['accessToken']).toBeDefined();
      } catch (err) {

        throw err;

      }
    });
  });

  afterAll(async () => {
    await queryRunner.connection.destroy();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });
});
