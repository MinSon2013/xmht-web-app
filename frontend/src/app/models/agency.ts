export interface Agency {
    id: number;
    userId: number,
    agencyName: string;
    address: string;
    phone: string
    note: string;
    email: string;
    contract: string,
    userName: string,
    password: string,
    confirmPassword: '',
    role?: number;
    updatedByUserId?: number;
}
