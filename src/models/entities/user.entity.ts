import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    name: 'user_uuid'
  })
  userUuid: string;

  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 50
  })
  userId: string;

  @Column({
    name: 'user_nickname',
    type: 'varchar',
    length: 50
  })
  userNickname: string;

  @Column({
    name: 'user_password',
    type: 'varchar',
    length: 256
  })
  userPassword: string;

  @Column({
    name: 'user_twitter',
    type: 'varchar',
    nullable: true,
    length: 256
  })
  userTwitter: string | null;

  @Column({
    name: 'user_instagram',
    type: 'varchar',
    nullable: true,
    length: 256
  })
  userInstagram: string | null;

  @Column({
    name: 'user_facebook',
    type: 'varchar',
    nullable: true,
    length: 256
  })
  userFacebook: string | null;
}


export class SigninPacket {

  userId: string;
  password: string;
  constructor(partial: Partial<User>){
    this.userId = partial.userId;
    this.password = partial.userPassword;
  }
}