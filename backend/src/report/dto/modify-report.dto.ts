export class ModifyReportDTO {
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
  // userId: number;
  // createDate?: string;
  fullName?: string;
  otherStoreName: string;
  updatedByUserId: number;
}