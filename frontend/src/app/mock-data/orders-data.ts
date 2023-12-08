import { Order } from "../models/order";

export const ORDERS_DATA: Order[] = [
    {
        id: 4,
        createdDate: '02/01/2023',
        deliveryId: 1,
        pickupId: 1,
        productTotal: 50,
        driver: 'Tung',
        note: 'Giao dung ngay',
        transport: 1,
        licensePlates: 'KG1234',
        receivedDate: '10/01/2023',
        status: 4,
        statusLabel: 'Hủy',
        contract: 'HĐBB2023/AMHT',
        products: [
            {
                id: 4,
                name: 'PCB 40 (vỏ bao Phụ tử)',
                quantity: 50,
            },
        ],
        agencyId: 3,
        agencyName: 'Nguyen Cong Tri'
    },
    {
        id: 3,
        createdDate: '11/02/2023',
        deliveryId: 2,
        pickupId: 12,
        productTotal: 70,
        driver: 'Dung',
        note: 'Giao dung ngay',
        transport: 2,
        licensePlates: 'KG0910',
        receivedDate: '12/02/2023',
        status: 1,
        statusLabel: 'Đang chờ',
        contract: 'HĐBB2023/XMHT_KG',
        products: [
            {
                id: 1,
                name: 'PCB 30 (vỏ bao Phụ Tử)',
                quantity: 30,
            },
            {
                id: 2,
                name: 'PCB 30 (vỏ bao Sư Tử)',
                quantity: 10,
            },
            {
                id: 4,
                name: 'PCB 40 (vỏ bao Phụ tử)',
                quantity: 30,
            },
        ],
        agencyId: 1,
        agencyName: 'CN Thuy Thuy'
    },
    {
        id: 2,
        createdDate: '01/02/2023',
        deliveryId: 3,
        pickupId: 60,
        productTotal: 30,
        driver: 'Nguyen Thanh Tam',
        note: 'Giao dung ngay',
        transport: 1,
        licensePlates: 'CT0989',
        receivedDate: '20/02/2023',
        status: 2,
        statusLabel: 'Đang nhận',
        contract: 'HĐBB2023/XMHT',
        products: [
            {
                id: 1,
                name: 'PCB 30 (vỏ bao Phụ Tử)',
                quantity: 10,
            },
            {
                id: 3,
                name: 'PCB 40 (vỏ bao Sử Tử) ',
                quantity: 20,
            },
        ],
        agencyId: 2,
        agencyName: 'SPA Ga'
    },
    {
        id: 1,
        createdDate: '02/01/2023',
        deliveryId: 2,
        pickupId: 24,
        productTotal: 15,
        driver: 'Tran Minh',
        note: 'Giao dung ngay',
        transport: 1,
        licensePlates: 'KG1234',
        receivedDate: '10/01/2023',
        status: 3,
        statusLabel: 'Đã nhận',
        contract: 'HĐBB2023/AMHT',
        products: [
            {
                id: 4,
                name: 'PCB 40 (vỏ bao Phụ tử)',
                quantity: 15,
            },
        ],
        agencyId: 3,
        agencyName: 'Luu Thien Huong'
    },
];