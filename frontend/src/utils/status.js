export const statusLabels = {
    WAITING:"Chờ nhận", PENDING:"Chờ xác nhận", CONFIRMED:"Đã xác nhận", PROCESSING:"Đang xử lý",
    SHIPPING:"Đang giao", IN_TRANSIT:"Đang vận chuyển", PICKED_UP:"Đã lấy hàng", ASSIGNED:"Đã phân công",
    DELIVERED:"Đã giao", COMPLETED:"Hoàn tất", CANCELLED:"Đã hủy", FAILED:"Thất bại",
    AVAILABLE:"Sẵn sàng", BUSY:"Đang làm việc", ACTIVE:"Hoạt động", INACTIVE:"Ngừng hoạt động",
    OFFLINE:"Ngoại tuyến", ONLINE:"Trực tuyến", MAINTENANCE:"Bảo trì", VERIFIED:"Đã xác minh",
    ADMIN:"Quản trị viên", WAREHOUSE_MANAGER:"Quản lý kho", DRIVER:"Tài xế", CUSTOMER:"Khách hàng"
};
export const statusLabel = value => statusLabels[value] || value;
