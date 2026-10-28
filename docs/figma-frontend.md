# Giao diện SmartLogistics

Nguồn thiết kế: https://www.figma.com/design/LC7wdjcb51PFNe6SoFlFXE

## Phạm vi triển khai

Frontend hiện tại dùng bộ màu teal/ink/mint, font Inter cục bộ, sidebar 248px, bảng, thẻ, form và modal dùng chung. Desktop có sidebar, mobile có menu thu gọn; tài xế có thanh điều hướng dưới. Các trang cũ tiếp tục dùng Axios, JWT, refresh token và Socket.IO của dự án.

| Nhóm | Route / cách mở |
| --- | --- |
| Xác thực | `/login`, `/register`, `/forgot-password` |
| Điều hành | `/dashboard`, `/orders`, `/orders/:orderId`, `/shipments` |
| Kho | `/warehouses`, `/inventory`, `/products` |
| Quản trị | `/drivers`, `/vehicles`, `/customers`, `/users`, `/roles`, `/settings`, `/reports` |
| Tài xế | `/driver-dashboard`, `/available-jobs`, `/shipments`, `/wallet` |
| Khách hàng | `/customer-dashboard`, `/customer-dashboard?create=1`, `/orders`, `/addresses` |
| Dùng chung | `/tracking`, `/tracking/:shipmentId`, `/ai-routes`, `/map`, `/notifications`, `/account`, `/access-denied` |

Các màn tạo/sửa, phân công, chi tiết và xác nhận giao được tích hợp dưới dạng modal của các route trên. Không cần tạo route riêng cho mỗi frame Figma.

## Kết nối backend thật

Chạy backend và SQL Server theo README gốc. Trong `frontend`, sao chép `.env.example` thành `.env.local` nếu cần thay địa chỉ; sau đó `npm run dev`. Mặc định REST là `http://localhost:5000/api`, Socket.IO là `http://localhost:5000`. Không đưa token hoặc mật khẩu thật vào file mẫu. Không thay đổi backend/schema trong đợt giao diện này.

GPS chỉ hiện nút gửi cho tài xế được phân công; người dùng chủ động bật chia sẻ mỗi 5 giây. Vị trí hiển thị nhận từ Socket.IO, không dựng vị trí tài xế mẫu trong ứng dụng. Leaflet cần mạng để tải bản đồ OpenStreetMap.

## Kiểm chứng

`npm run build` và `npm run lint` trong frontend. Bài kiểm thử trình duyệt nằm ở `frontend/tests/figma-ui.smoke.cjs`, chạy với Postman simulation trong `postman/simulations/frontend/frontend.sim.yaml`. Xem `postman/README.md` để chạy lại. Ảnh và kết quả nằm trong `frontend/test-results/figma` (được Git bỏ qua).

Đã kiểm tra đăng nhập, ghi/lưu lại tồn kho và cấu hình, mở chi tiết đơn từ dashboard khách hàng, tạo đơn, giao hàng của tài xế, chặn route sai vai trò, hiển thị desktop/mobile và render các trang quản lý. Đây là kiểm thử với HTTP fixture theo mã backend; chưa xác nhận SQL Server, AI thật, thanh toán hoặc GPS/Socket.IO thật.

## Giới hạn cần backend bổ sung

Thiết kế có một số chức năng chưa có endpoint tương ứng trong repo: khôi phục mật khẩu bằng email, tự sửa hồ sơ, CRUD địa chỉ/default address, gửi sự cố kèm tệp và chứng từ giao hàng bằng ảnh/chữ ký. UI hiển thị giới hạn rõ ràng; danh sách địa chỉ được suy ra từ các đơn gần đây. Không tạo thông báo thành công cho các chức năng này.

Figma Starter giới hạn lượt đọc thiết kế trong phiên: đã lấy trực tiếp các frame dashboard quản trị, đơn hàng, tài xế, khách hàng, đăng nhập và kho; các màn còn lại áp dụng cùng hệ thành phần. Chưa xác nhận độ khớp pixel của từng frame còn lại.
