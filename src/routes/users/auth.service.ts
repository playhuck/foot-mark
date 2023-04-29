import { Injectable, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersSignupDto } from "src/models/dtos/users/users.signup.dto";
import { User } from "src/models/entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { UserRepository } from "./users.repository";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly usersRepo: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async signup(dto: UsersSignupDto): Promise<any> {
    console.log("DTO:", dto);
    
    const { userId, nickName, password, passwordCheck } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    const queryRunnerManager = queryRunner.manager;
    try {
      if(password !== passwordCheck) throw new BadRequestException("Password do not match", "PWD-01");

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const [isUserByUserId,isUserByNickname] = await Promise.all([
        await this.usersRepo.isUserByUserId(queryRunnerManager, userId),
        await this.usersRepo.isUserByNickname(queryRunnerManager, nickName)
      ])  
      
      if(isUserByUserId) {
        throw new ConflictException("UserId Already Exist", "AUTH-001");
      }
      
      if(isUserByNickname) {
        throw new ConflictException("Nickname Already Exist", "AUTH-002");
      }
    
      const create = queryRunnerManager.create(User, {
        user_id: userId,
        user_nickname: nickName,
        user_password: password
      });

      const save = queryRunnerManager.save(create);
      await queryRunner.commitTransaction();
 
      return save;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
