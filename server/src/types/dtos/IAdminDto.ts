export interface IAdminDto {
    adminId: string;
    username: string;
    email: string;
    role: 'superadmin' | 'agent' | 'manager';
    regist_date: string;
}