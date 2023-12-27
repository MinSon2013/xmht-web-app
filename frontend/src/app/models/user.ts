export interface User {
    id: number,
    userName: string,
    password: string,
    isAdmin: boolean,
    token?: string,
    expiresAt?: number
    role: number;
    roleLabel?: string;
    districtId?: number;
    districtName?: string;
    fullName?: string;
    updatedDate?: string;
    updatedByUserId: number;
}