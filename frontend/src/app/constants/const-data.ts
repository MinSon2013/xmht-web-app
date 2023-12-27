import { Pickup } from "../models/pickup"

export const Cities: Pickup[] = [
  { id: 1, label: 'An Giang' },
  { id: 5, label: 'Bạc Liêu' },
  { id: 7, label: 'Bến Tre' },
  { id: 12, label: 'Cà Mau' },
  { id: 13, label: 'Cần Thơ' },
  { id: 19, label: 'Đồng Nai' },
  { id: 20, label: 'Đồng Tháp' },
  { id: 28, label: 'Hậu Giang' },
  { id: 31, label: 'Khánh Hòa' },
  { id: 32, label: 'Kiên Giang' },
  { id: 33, label: 'Phú Quốc - KG' },
  { id: 38, label: 'Long An' },
  { id: 50, label: 'Sóc Trăng' },
  { id: 57, label: 'Tiền Giang' },
  { id: 58, label: 'TP Hồ Chí Minh' },
  { id: 59, label: 'Trà Vinh' },
]

export const Transports = [
  { id: 1, label: 'Đường bộ' },
  { id: 2, label: 'Đường thủy' },
]

export const STATUS = [
  { value: 1, label: 'Chờ giải quyết' },
  { value: 2, label: 'Đồng ý đơn hàng' },
  { value: 3, label: 'Đang giao hàng' },
  { value: 4, label: 'Đã giao hàng' },
  { value: 5, label: 'Hủy đơn hàng' },
]

export const RECEIPT = [
  { value: 1, label: 'Bành, võng' },
  { value: 2, label: 'Xá' },
]

export const MSG_STATUS = {
  SUCCESS: 1,
  FAIL: 2
}

export const SERVICE_TYPE = {
  PRODUCTSERVICE: 1,
  AGENCYSERVICE: 2,
  ORDERSERVICE: 3,
  NOTIFYSERVICE: 4,
  DISTRICTSERVICE: 5,
  STORESERVICE: 6,
  USERSERVICE: 7,
}


export const NOTIFY_TYPE = {
  GENERAL: 1,
  COUPON: 2,
  UNREAD: 3,
}

export const USER_ROLE = [
  {
    value: 1,
    role: 'STOCKER',
    label: 'Thủ kho',
  },
  {
    value: 2,
    role: 'USER_SALESMAN',
    label: 'Người bán hàng',
  },
  {
    value: 3,
    role: 'USER_AREA_MANAGER',
    label: 'Quản lý khu vực',
  },
]

export const ROLE = [0, 1, 2, 3];
export const ADMIN = 0;
export const STOCKER = 1;
export const USER_SALESMAN = 2;
export const USER_AREA_MANAGER = 3;
export const AGENCY = 4;