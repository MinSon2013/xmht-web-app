export interface Notify {
    id: number;
    agencyId: number;
    agencyList?: number[];
    contents: string;
    fileName: string;
    note: string;
    isPublished: boolean;
    createdDate: string,
    shortContents: string;
    agencyName?: string;
    mimeType: string;
    filePath?: string;
    file?: any;
    isViewed: boolean;
    sender: number;
    notificationType: number;
    updatedDate: string;
    orderId: number;
    statusOrder: string;
    checkedItem?: boolean;
    showDetail: boolean;
    showLabel: string;
}