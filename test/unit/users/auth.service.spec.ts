import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/routes/users/auth.service";
import { INestApplication } from '@nestjs/common';
import { faker } from "@faker-js/faker";
import { User } from "src/models/entities/user.entity";
import { UsersSignupDto } from "src/models/dtos/users/users.signup.dto";
import { DataSource, EntityManager, QueryRunner } from "typeorm";

describe("AuthService", () => {
  let app: INestApplication;
  let service: AuthService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let queryRunnerManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
    queryRunnerManager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Signup", () => {
    it("회원가입 후, 유저를 반환한다.", async () => {
      const password = faker.internet.password();
      const userId = faker.datatype.uuid();
      const nickName = faker.datatype.uuid();
      const user: UsersSignupDto = {
        userId,
        nickName,
        password,
        passwordCheck: password,
      };

      const singup = await service.signup(user);

      // expect(singup).toBeDefined();
      // expect(singup.)
    });
  });
});
