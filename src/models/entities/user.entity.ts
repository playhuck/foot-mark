import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_uuid: string;

  @Column('varchar')
  user_id: string;

  @Column('varchar')
  user_nickname: string;

  @Column('varchar')
  user_password: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  user_twitter: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  user_instagram: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  user_facebook: string | null;
}
