export interface IAdmin {
    admin_id: string;
    username: string;
    email: string;
    hash_password: string;
    role: 'superadmin' | 'agent' | 'manager';
    is_deleted: boolean
}