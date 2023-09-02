import { DataSource, EntityManager, Repository } from "typeorm";
import { User } from "src/models/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { UsersSimplePacket } from "src/models/packets/users/users.simple.packet";

@Injectable()
export class UserRepository extends Repository<User> {

  constructor(private readonly dataSource: DataSource) {
    const baseRepository = dataSource.getRepository(User);
    super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner)
  }

  async isUserByUserId(entityManager: EntityManager, userId: string): Promise<boolean> {
    const isUserByUserId = await entityManager.query(`SELECT user_id FROM user WHERE user_id = ?`, [userId]);

    return isUserByUserId.length > 0 ? true : false;
  }

  async isUserByNickname(entitiyManager: EntityManager, nickName: string): Promise<boolean> {
    const isUserByNickname = await entitiyManager.query(`SELECT user_nickname FROM user WHERE user_nickname = ?`, [
      nickName,
    ]);

    return isUserByNickname.length > 0 ? true : false;
  }

  async findUserByUserId(userId: string): Promise<User> {
      const findSignInDtoByUserId = 
        await this
        .createQueryBuilder()
        .select([
          "user_id AS userId", 
          "user_password AS userPassword",
          "user_uuid AS userUuid"
        ])
        .where("user_id = :userId", { userId })
        .getRawMany();
        
    return findSignInDtoByUserId.length === 1 ? findSignInDtoByUserId[0] : null;
  }
}
