import { EntityManager, Repository } from "typeorm";
import { User } from "src/models/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { UsersSimplePacket } from "src/models/packets/users/users.simple.packet";

@Injectable()
export class UserRepository extends Repository<User> {
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

  async findUserByUserId(entitiyManager: EntityManager, userId: string): Promise<UsersSimplePacket | null> {
    const findSignInDtoByUserId = await entitiyManager.query(
      `SELECT user_id as userId, user_password as password, user_uuid as userUuid FROM user WHERE user_id = ?`,
      [userId],
    );
    const { packet,_ } = findSignInDtoByUserId;
    return packet.length === 1 ? packet[0] : null;
  }
}
