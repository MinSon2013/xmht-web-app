export class ModifyReportDto {
  id?: number;
  agencyId: number;
  districtId: number;
  provinceId: number;
  storeId: number;
  storeInformation: string;
  reportContent: string;
  attachFile: string;
  filePath: string;
  note: string;
  updatedDate: string;
  userId: number;
  createDate?: string;
  accountName?: string;
  otherStoreName?: string;
  updatedByUserId: string;
}