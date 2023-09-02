import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersSigninDto, UsersSignupDto, User } from "src/models/_loader";
import { DataSource, Repository, QueryFailedError } from "typeorm";
import { UserRepository } from "./users.repository";
import { BcryptProvider } from "src/common/providers/bcrypt.provider";
import { ERROR_MESSAGE_LIST, ErrorCode } from "src/constants/error_codes/error.code";
import { JwtProvider } from "src/common/providers/jwt.provider";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly usersRepo: UserRepository,
    private readonly dataSource: DataSource,
    private readonly bcryptProvider: BcryptProvider,
    private readonly jwtProvider: JwtProvider
  ) { }

  async signup(dto: UsersSignupDto): Promise<User> {
    const { userId, nickName, password, passwordCheck } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    const queryRunnerManager = queryRunner.manager;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const [matchedPassword, isUserByUserId, isUserByNickname] = await Promise.all([
        await this.bcryptProvider.matchedPassword(password, passwordCheck),
        await this.usersRepo.isUserByUserId(queryRunnerManager, userId),
        await this.usersRepo.isUserByNickname(queryRunnerManager, nickName),
      ]);

      if (!matchedPassword) throw new BadRequestException(ERROR_MESSAGE_LIST["PWD-001"], ErrorCode.PwdSignupMismatch);
      if (isUserByUserId) throw new ConflictException(ERROR_MESSAGE_LIST["AUTH-001"], ErrorCode.AuthUserExists);
      if (isUserByNickname) throw new ConflictException(ERROR_MESSAGE_LIST["AUTH-002"], ErrorCode.AuthNicknameExists);

      const hashedPassword = this.bcryptProvider.hashPassword(password);

      const create = queryRunnerManager.create(User, {
        userId,
        userNickname: nickName,
        userPassword: hashedPassword,
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

  async signin(dto: UsersSigninDto): Promise<{ accessToken: string }> {
    try {
      const { userId } = dto;
      const inputPassword = dto.password;
      
      const findSignInDtoByUserId = await this.usersRepo.findUserByUserId(userId);
      
      if (findSignInDtoByUserId === null)
        throw new UnauthorizedException(ERROR_MESSAGE_LIST["AUTH-003"], ErrorCode.AuthUserNotExists);
      const { userPassword, userUuid } = findSignInDtoByUserId;
      const comparedPassword = await this.bcryptProvider.comparedPassword(inputPassword, userPassword);
      if (!comparedPassword) throw new UnauthorizedException(ERROR_MESSAGE_LIST["PWD-002"], ErrorCode.PwdDbMismatch);

      const token = await this.jwtProvider.signAccessToken({
        type : 'AccessToken',
        userUuid
      });

      return { accessToken : token };

    } catch (err) {

      throw err;

    }
  }
}
