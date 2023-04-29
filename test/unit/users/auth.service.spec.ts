import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/routes/users/auth.service";
import { INestApplication, ConflictException } from "@nestjs/common";
import { faker } from "@faker-js/faker";
import { User } from "src/models/entities/user.entity";
import { UsersSignupDto } from "src/models/dtos/users/users.signup.dto";
import { DataSource, EntityManager, QueryRunner, Repository } from "typeorm";
import { AppModule } from "src/app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { v4 } from "uuid";
import { UserRepository } from "src/routes/users/users.repository";

describe("AuthService", () => {
  let app: INestApplication;
  let module: TestingModule;
  let service: AuthService;
  let dataSource: DataSource;
  let userRepository: UserRepository;
  let usersSignupDto: UsersSignupDto;

  let queryRunner: QueryRunner;
  let queryRunnerManager: EntityManager;

  const password = faker.internet.password();
  const userId = faker.datatype.uuid();
  const nickName = faker.datatype.uuid();
  const userUuid = v4();

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

    /** mock userRepository */
    userRepository = module.get<UserRepository>(UserRepository);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
    queryRunnerManager = queryRunner.manager;

    return app;
  });

  beforeEach(async () => {
    usersSignupDto = {
      userId: userId,
      nickName: nickName,
      password: password,
      passwordCheck: password,
    };
    await queryRunner.connect();
  });

  describe("Signup", () => {
    let user: User = {
      user_uuid: userUuid,
      user_id: userId,
      user_nickname: nickName,
      user_password: password,
      user_twitter: null,
      user_instagram: null,
      user_facebook: null,
    };

    it("아이디는 중복될 수 없다, AUTH-001", async () => {
      usersSignupDto.userId = "userId";
      const isUserByUserId = await userRepository.isUserByUserId(queryRunnerManager, usersSignupDto.userId);
      jest.spyOn(userRepository, "isUserByUserId").mockResolvedValueOnce(isUserByUserId);

      try {
        await service.signup(usersSignupDto);
      } catch (err: unknown) {
        expect(err).toBeDefined();
        expect(err instanceof ConflictException && err["message"]).toBe("UserId Already Exist");
        expect(err instanceof ConflictException && err["status"]).toBe(409);
        expect(err instanceof ConflictException && err["response"]["error"]).toBe("AUTH-001");
      }
    });

    it("닉네임은 중복될 수 없다, AUTH-002", async () => {
      usersSignupDto.nickName = "nickName";
      const isUserByNickname = await userRepository.isUserByNickname(queryRunnerManager, usersSignupDto.nickName);
      jest.spyOn(userRepository, "isUserByNickname").mockResolvedValueOnce(isUserByNickname);

      try {
        await service.signup(usersSignupDto);
        
      } catch (err: unknown) {
        expect(err).toBeDefined();
        expect(err instanceof ConflictException && err["message"]).toBe("Nickname Already Exist");
        expect(err instanceof ConflictException && err["status"]).toBe(409);
        expect(err instanceof ConflictException && err["response"]["error"]).toBe("AUTH-002");
      }
    });

    it("회원가입 후, 유저를 반환한다.", async () => {
      const usersSignupDto: UsersSignupDto = {
        userId: userId,
        nickName: nickName,
        password: password,
        passwordCheck: password,
      };
      jest.spyOn(service, "signup").mockResolvedValue(user);

      const result = await service.signup(usersSignupDto);

      expect(result).toBe(user);
    });
  });

  afterAll(async () => {
    await app.close();
    await queryRunner.release();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  })
})

