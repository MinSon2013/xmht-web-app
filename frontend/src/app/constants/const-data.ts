import { Pickup } from "../models/pickup"

export const Cities: Pickup[] = [
  { id: 1, label: 'An Giang' },
 /*  { id: 2, label: 'Bà Rịa - Vũng Tàu' },
  { id: 3, label: 'Bắc Giang' },
  { id: 4, label: 'Bắc Kạn' }, */
  { id: 5, label: 'Bạc Liêu' },
 /*  { id: 6, label: 'Bắc Ninh' }, */
  { id: 7, label: 'Bến Tre' },
/*   { id: 8, label: 'Bình Định' },
  { id: 9, label: 'Bình Dương' },
  { id: 10, label: 'Bình Phước' },
  { id: 11, label: 'Bình Thuận' }, */
  { id: 12, label: 'Cà Mau' },
  { id: 13, label: 'Cần Thơ' },
 /*  { id: 14, label: 'Cao Bằng' },
  { id: 15, label: 'Đà Nẵng' },
  { id: 16, label: 'Đắk Lắk' },
  { id: 17, label: 'Đắk Nông' },
  { id: 18, label: 'Điện Biên' }, */
  { id: 19, label: 'Đồng Nai' },
  { id: 20, label: 'Đồng Tháp' },
 /*  { id: 21, label: 'Gia Lai' },
  { id: 22, label: 'Hà Giang' },
  { id: 23, label: 'Hà Nam' },
  { id: 24, label: 'Hà Nội' },
  { id: 25, label: 'Hà Tĩnh' },
  { id: 26, label: 'Hải Dương' },
  { id: 27, label: 'Hải Phòng' }, */
  { id: 28, label: 'Hậu Giang' },
  /* { id: 29, label: 'Hòa Bình' }, */
 /*  { id: 30, label: 'Hưng Yên' }, */
  { id: 31, label: 'Khánh Hòa' },
  { id: 32, label: 'Kiên Giang' },
  { id: 33, label: 'Phú Quốc - KG' },
 /*  { id: 34, label: 'Lai Châu' },
  { id: 35, label: 'Lâm Đồng' },
  { id: 36, label: 'Lạng Sơn' },
  { id: 37, label: 'Lào Cai' }, */
  { id: 38, label: 'Long An' },
 /*  { id: 39, label: 'Nam Định' },
  { id: 40, label: 'Nghệ An' },
  { id: 41, label: 'Ninh Bình' },
  { id: 42, label: 'Ninh Thuận' },
  { id: 43, label: 'Phú Thọ' },
  { id: 44, label: 'Phú Yên' },
  { id: 45, label: 'Quảng Bình' },
  { id: 46, label: 'Quảng Nam' },
  { id: 47, label: 'Quảng Ngãi' },
  { id: 48, label: 'Quảng Ninh' },
  { id: 49, label: 'Quảng Trị' }, */
  { id: 50, label: 'Sóc Trăng' },
 /*  { id: 51, label: 'Sơn La' },
  { id: 52, label: 'Tây Ninh' },
  { id: 53, label: 'Thái Bình' },
  { id: 54, label: 'Thái Nguyên' },
  { id: 55, label: 'Thanh Hóa' },
  { id: 56, label: 'Thừa Thiên Huế' }, */
  { id: 57, label: 'Tiền Giang' },
  { id: 58, label: 'TP Hồ Chí Minh' },
  { id: 59, label: 'Trà Vinh' },
 /*  { id: 60, label: 'Tuyên Quang' },
  { id: 61, label: 'Vĩnh Long' },
  { id: 62, label: 'Vĩnh Phúc' },
  { id: 63, label: 'Yên Bái' }, */
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

export const STOCKER = 1;
export const USER_SALESMAN = 2;
export const USER_AREA_MANAGER = 3;