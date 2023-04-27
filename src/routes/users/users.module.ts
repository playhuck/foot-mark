import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PassportModule } from '@nestjs/passport/dist';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategyPassport } from 'src/common/passports/jwt.passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { User } from 'src/models/entities/user.entity';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: fs.readFileSync(
        path.join(__dirname, '../../../secrets/jwt.private.pem'),
        'utf8',
      ),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategyPassport, AuthService],
  exports: [UsersService, JwtModule, PassportModule],
})
export class UsersModule {}
