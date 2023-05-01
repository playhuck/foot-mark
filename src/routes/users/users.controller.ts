import { Body, Post, Controller } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthService } from "./auth.service";
import { UsersSignupDto } from "src/models/dtos/users/users.signup.dto";
import { User } from "src/models/entities/user.entity";
import { UsersSigninDto } from "src/models/_loader";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService, private authService: AuthService) {}

  @Post("/signup")
  async signup(@Body() body: UsersSignupDto): Promise<User> {
    const signup = await this.authService.signup(body);
    return signup;
  };

  @Post("/signin")
  async signin(@Body() body: UsersSigninDto): Promise<any> {
    const signin = await this.authService.signin(body);
    return ;
  }
}
