import { INavbarData } from "../helpers/helper";

export const NavbarData: INavbarData[] = [
    {
        routeLink: 'dashboard',
        icon: 'fa-house',
        label: 'Trang chủ',
    },
    {
        routeLink: 'orders',
        icon: 'fa-cart-shopping',
        label: 'Quản lý đơn hàng',
        items: [
            {
                routeLink: 'orders/list',
                icon: 'fa-list',
                label: 'Danh sách đơn hàng',
            },
            {
                routeLink: 'orders/add',
                icon: 'fa-plus',
                label: 'Tạo mới đơn hàng',
            },
        ]
    },
    {
        routeLink: 'products',
        icon: 'fa-box-open',
        label: 'Sản phẩm',
    },
    {
        routeLink: 'agency',
        icon: 'fa-user',
        label: 'Nhà phân phối',
    },
    {
        routeLink: 'statistics',
        icon: 'fa-chart-column',
        label: 'Thống kê báo cáo',
    },
    {
        routeLink: 'notify',
        icon: 'fa-bell',
        label: 'Thông báo',
    },
    {
        routeLink: 'logout',
        icon: 'fa-right-from-bracket',
        label: 'Đăng xuất',
    },
];