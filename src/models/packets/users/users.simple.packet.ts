import { RowDataPacket } from "mysql2";

export interface UsersSimplePacket extends RowDataPacket {
    userId : string;
    nickName : string;
    password : string;
    userUuid : string;
    userFacebook? : string | null;
    userTwitter? : string | null;
    userInstagram? : string | null;
}