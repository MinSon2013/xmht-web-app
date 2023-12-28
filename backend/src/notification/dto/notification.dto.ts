export class NotificationDTO {
  id?: number;
  orderId: number;
  reportId: number;
  contents: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  notificationType: number;
  note: string;
  isPublished: boolean;
  createdDate?: string;
  updatedDate: string;
  statusOrder: string;
  isViewed: boolean;
  sender: number;
  agencyId: number;
  agencyList?: number[];
}