export class SearchOrderDTO {
    approvedNumber: number;
    agencyId: number;
    productId: number;
    startDate: string;
    endDate: string;
    status: number;
    userId: number; // Login userId
    take: number;
    skip: number;
}