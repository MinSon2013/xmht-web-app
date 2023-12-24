export interface User {
    id: number,
    username: string,
    password: string,
    isAdmin: boolean,
    token?: string,
    expiresAt?: number
    isStocker?: boolean;
    role: number;
    roleLabel?: string;
    districtId?: number;
    districtName?: string;
    fullName?: string;
}