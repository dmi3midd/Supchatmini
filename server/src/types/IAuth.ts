import type { IAdminDto } from "./dtos/IAdminDto.js";

export interface IAuth {
    admin: IAdminDto;
    accessToken: string;
    refreshToken: string;
}