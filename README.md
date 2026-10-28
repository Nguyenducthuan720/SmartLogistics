# Smart Logistics & Supply Chain Platform

Ứng dụng web quản lý giao vận cho đồ án tốt nghiệp: đơn hàng, chuyến giao, tài xế, phương tiện, kho, sản phẩm, tồn kho, tracking và ước tính ETA. Có thêm cơ chế nhận chuyến, ví tài xế và đánh giá.

Tài liệu đối chiếu mã nguồn ngày 28/10/2026. Có module không đồng nghĩa toàn bộ chức năng đã được kiểm thử hoặc sẵn sàng vận hành thực tế.

## Tài liệu

- [Cấu trúc, nghiệp vụ và hiện trạng](docs/PROJECT_OVERVIEW.md)
- [Cài đặt và chạy](docs/SETUP.md)
- [Các vấn đề và thứ tự hoàn thiện](docs/PROJECT_REVIEW.md)
- [Đề cương và quy tắc phát triển](AGENTS.md)

## Cấu trúc hiện có

```text
SmartLogistics/
├── backend/
│   ├── src/config/        Database, JWT, Socket.IO, Swagger
│   ├── src/middleware/   Auth, role, validation, lỗi, rate limit
│   ├── src/modules/      Controller, service, model, routes
│   ├── src/socket/       Sự kiện vị trí tài xế
│   ├── src/utils/        Response, logger, hash, phân trang
│   ├── scripts/          Seed tài khoản demo
│   └── database.md       Script T-SQL
├── frontend/src/         React: pages, components, contexts, routes, services
├── ai-service/           Flask: ETA và tối ưu điểm giao
└── docs/                 Tài liệu dự án
```

Frontend gọi Express tại `http://localhost:5000/api`. Backend truy cập SQL Server, gọi Python ở `http://localhost:5001` và phục vụ Socket.IO trên cùng cổng HTTP.

Luồng hiện có: khách tạo đơn → backend thử tạo shipment → quản lý phân công hoặc tài xế nhận chuyến → lấy hàng → vận chuyển → giao thành công → thử ghi thu nhập ví → đánh giá.

ETA hiện dùng công thức theo vận tốc và hệ số, chưa dùng mô hình Random Forest đã huấn luyện. GPS tự động mỗi 5 giây và một số bảo đảm về phân quyền, giao dịch, trạng thái chưa hoàn thiện; xem báo cáo chi tiết.
