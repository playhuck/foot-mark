import { Injectable, ConflictException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersSignupDto } from "src/models/dtos/users/users.signup.dto";
import { User } from "src/models/entities/user.entity";
import { DataSource, Repository, QueryFailedError } from "typeorm";
import { UserRepository } from "./users.repository";
import { BcryptProvider } from "src/common/providers/bcrypt.provider";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly usersRepo: UserRepository,
    private readonly dataSource: DataSource,
    private readonly bcryptProvider: BcryptProvider,
  ) {}

  async signup(dto: UsersSignupDto): Promise<any> {
    const { userId, nickName, password, passwordCheck } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    const queryRunnerManager = queryRunner.manager;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const matchedPassword = await this.bcryptProvider.matchedPassword(password, passwordCheck);
      if (!matchedPassword) throw new BadRequestException("Password do not match", "PWD-001");
      const hashedPassword = this.bcryptProvider.hashPassword(password);

      const [isUserByUserId, isUserByNickname] = await Promise.all([
        await this.usersRepo.isUserByUserId(queryRunnerManager, userId),
        await this.usersRepo.isUserByNickname(queryRunnerManager, nickName),
      ]);

      if (isUserByUserId) throw new ConflictException("UserId Already Exist", "AUTH-001");

      if (isUserByNickname) throw new ConflictException("Nickname Already Exist", "AUTH-002");

      const create = queryRunnerManager.create(User, {
        user_id: userId,
        user_nickname: nickName,
        user_password: hashedPassword,
      });

      try {
        const save = await queryRunnerManager.save(create);
        await queryRunner.commitTransaction();

        return save;
      } catch (err) {
        if (err instanceof QueryFailedError) {
          throw new InternalServerErrorException(`DATABASE ERROR : ${err.message}`, "Internal Server Error");
        } else {
          throw new InternalServerErrorException(`SERVER ERROR : ${err.message}`, "Internal Server Error");
        }
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
