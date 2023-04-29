import { Module } from "@nestjs/common";
import { UsersController } from "./routes/users/users.controller";
import { UsersModule } from "./routes/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { User } from "./models/entities/user.entity";

const TNODE = process.env.NODE_ENV === "prod" ? "" : `.${process.env.NODE_ENV}`;

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: "mariadb",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        entities: [User],
        synchronize: true,
        cache: true, 
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${TNODE}`,
    }),
  ],
  controllers: [UsersController],
  providers: [],
})
export class AppModule {}
