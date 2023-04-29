import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from 'src/models/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

/** NestJS의 Injectable 데코레이터로 클래스를 선언 */
@Injectable()
/** PassportStrategy 클래스를 상속하는 JwtStrategyPassport 클래스 */
export class JwtStrategyPassport extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // Users 엔티티의 레포지토리를 usersRepository 변수로 선언
  ) {
    super({
      /** JWT SECRET KEY, TOKEN이 유효한지 CHECK할 때 사용 */
      secretOrKey: fs.readFileSync(
        path.join(__dirname, '../../../secrets/jwt.public.pem'),
        'utf8',
      ), // Public PEM
      /** TOKEN이 어디서 가져올 지 Header에서 가져올 때 Bearer라는 값을 가지고 있는지 확인 (공식) */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // JWT를 HTTP 요청 헤더에서 추출하는 방법
      algorithms: ['RS256'],
    });
  }

  /** Passport가 JWT를 검증할 때 실행되는 메서드 */
  async validate(payload: any) {
    /** JWT 페이로드에서 id 추출 */

    const { userUuid } = payload;
    const user: User = await this.usersRepository.findOne({ where: { user_uuid : userUuid } });
    /** usersRepository를 사용하여 username으로 사용자를 찾음 */
    console.log(user);
    /** 사용자를 찾지 못한 경우 UnauthorizedException 발생 */
    if (!user) throw new UnauthorizedException('user 객체를 찾을 수 없습니다.');

    /** 사용자 객체 반환 */
    return user;
  }
}
