export class NotificationDto {
  id?: number;
  contents: string;
  shortContents: string;
  fileName: string;
  note: string;
  isPublished: boolean;
  agencyList?: number[];
  createdDate: string;
  mimeType: string;
  filePath?: string;
  isViewed: boolean;
  sender: number;
}