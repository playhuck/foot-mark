import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

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
  user_twitter: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  user_instagram: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  user_facebook: string;
}
