export interface UserDTO {
    id?: number;
    userName: string;
    password: string;
    role: number;
    districtId: number;
    fullName: string;
    updatedByUserId: number;
}