import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersSignupDto } from "src/models/dtos/users/users.signup.dto";
import { User } from "src/models/entities/user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private readonly dataSource: DataSource) {}

  async signup(dto: UsersSignupDto): Promise<User> {

    // const queryRunner = this.dataSource.createQueryRunner();
    // const queryRunnerManager = queryRunner.manager;

    // await queryRunner.connect();
    // const create = await this.userRepository.create({ ...dto });
    return
  }
}
