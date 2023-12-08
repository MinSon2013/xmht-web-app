export class ModifyAgencyDto {
  id?: number;
  userId: number;
  fullName: string;
  address: string;
  phone: string;
  note: string;
  email: string;
  contract: string;
  accountName?: string;
  password?: string;
}