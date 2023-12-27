export interface UserRoleDto {
    id?: number;
    username: string;
    password: string;
    isAdmin: boolean;
    role: number;
    districtId: number;
    fullName: string;
    updatedByUserId: string;
}