import type { IAdminDto } from "../types/dtos/IAdminDto.js";
import type { IAdmin } from "../types/postgresql/IAdmin.js";

export class AdminDto implements IAdminDto {
    adminId: string;
    username: string;
    email: string;
    role: 'superadmin' | 'agent' | 'manager';
    constructor (admin: IAdmin) {
        this.adminId = admin.admin_id;
        this.username = admin.username;
        this.email = admin.email;
        this.role = admin.role;
    }
}