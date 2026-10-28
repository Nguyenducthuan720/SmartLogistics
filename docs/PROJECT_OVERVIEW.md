# Cấu trúc và quy trình dự án

## Dự án này là gì?

Đây là nền tảng quản lý logistics kết hợp quản trị nội bộ doanh nghiệp với tài xế nhận chuyến, ví thu nhập và đánh giá. Có bốn vai trò: ADMIN, WAREHOUSE_MANAGER, DRIVER, CUSTOMER.

Phạm vi có kho, hàng hóa, tồn kho và vận chuyển. Chưa thấy các module mua hàng, nhà cung cấp hoặc hoạch định nhu cầu trong danh sách mã nguồn nên chưa đủ cơ sở gọi đây là hệ thống quản lý toàn bộ chuỗi cung ứng.

## Kiến trúc đang triển khai

| Thành phần | Công nghệ đọc từ package/mã nguồn | Trách nhiệm |
| --- | --- | --- |
| Frontend | React 19, Vite 8, Tailwind 4, Axios, React Router, Leaflet | Giao diện, gọi API và nhận socket |
| Backend | Express 5, MSSQL, JWT, bcrypt, Socket.IO | Xác thực, nghiệp vụ và truy cập SQL Server |
| Python | Flask, NumPy, scikit-learn, pandas, joblib | ETA và sắp xếp điểm giao |
| Bản đồ | Tích hợp Nominatim, OSRM trong backend | Tìm tọa độ và lấy tuyến đường |

Điểm chạy backend là `backend/src/server.js`, chỉ mở HTTP sau khi kết nối database thành công. `src/app.js` gắn middleware, `/api` và `/api-docs`.

Các nhóm route đã đăng ký: auth, users, roles, permissions, customers, orders, shipments, drivers, vehicles, warehouses, inventory, products, tracking, notifications, ai, dashboard, reports, settings, mapping, wallets, reviews.

Phần lớn module dùng các tệp controller/service/model/routes cùng thư mục. Model đang thực hiện truy vấn SQL, tương đương trách nhiệm repository. Cấu trúc repository, DTO, mapper, validation chưa đồng nhất theo AGENTS.md; một số controller vẫn gọi model trực tiếp.

Frontend có pages cho dashboard quản lý/tài xế/khách, đơn hàng, shipment, nhận chuyến, kho, sản phẩm, xe, tài xế, tracking, AI, ví, báo cáo và thông báo. Context quản lý auth, socket và toast; service dùng Axios. Access token và refresh token được lưu ở localStorage.

`backend/database.md` có 31 lệnh CREATE TABLE, gồm cả DriverWallets, WalletTransactions, DriverEarnings và Reviews. Đây là SQL dù đuôi tệp là .md. Có bảng chưa chứng minh đã có quy trình hoàn chỉnh sử dụng bảng đó. Chưa thấy hệ thống migration có phiên bản trong danh sách tệp dự án.

## Quy trình vận hành thực tế cần có

1. Admin tạo tài khoản, vai trò; quản lý khai báo kho, sản phẩm, tồn kho, tài xế và xe.
2. Khách tạo đơn với hàng, số lượng, nơi lấy/giao và thông tin người nhận.
3. Quản lý kiểm tra dữ liệu, giá cước, khả năng phục vụ và tồn kho; xác nhận đơn, giữ hàng nếu xuất kho.
4. Lập shipment, chọn kho xuất, tài xế, xe phù hợp tải trọng và lịch làm việc; hoặc mở chuyến cho tài xế nhận.
5. Tài xế nhận nhiệm vụ, kiểm đếm và xác nhận lấy hàng thực tế.
6. Trong chuyến, cập nhật trạng thái và GPS, tính lại ETA; khách chỉ theo dõi chuyến của mình.
7. Khi giao thành công, lưu bằng chứng, đối soát tiền/COD nếu có, chốt tồn kho và đồng bộ trạng thái đơn/chuyến.
8. Ghi thu nhập, đối soát ví, tiếp nhận đánh giá; xử lý riêng giao thất bại, hủy và hoàn hàng.

Đây là quy trình mục tiêu. Mã hiện tại chưa hoàn thiện các bước giữ tồn kho, COD, bằng chứng giao và hoàn hàng xuyên suốt.

## Quy trình hiện có trong mã

| Bước | Hành vi đọc được | Giới hạn |
| --- | --- | --- |
| Tạo đơn | Controller yêu cầu ít nhất một item; service tạo order rồi thử tạo shipment | Shipment lỗi chỉ ghi log; order vẫn trả thành công |
| Trạng thái đơn | PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED | Chưa enforce thứ tự chuyển trong service |
| Điều phối | Có assign-driver, assign-vehicle và available jobs | Cần kiểm tra quyền theo kho, tải trọng và lịch rảnh |
| Nhận chuyến | Chọn WAITING chưa có tài xế; accept gán tài xế và chuyển PICKED_UP | Nhận nhiệm vụ bị gộp với lấy hàng; SELECT/UPDATE tách rời |
| Giao hàng | UI có WAITING → PICKED_UP → IN_TRANSIT → DELIVERED | Backend cần áp dụng cùng state machine |
| GPS | Tracking gửi vị trí qua socket bằng thao tác lấy vị trí hiện tại | driverId gắn cứng là 1, chưa tự gửi mỗi 5 giây |
| Thu nhập | DELIVERED có tài xế thì thử cộng ví 12% tổng tiền order | Lỗi ghi ví chỉ log; cần xác nhận cơ sở tính tiền |
| Đánh giá | Kiểm tra khách có hồ sơ, shipment có tài xế, điểm 1–5 và chưa đánh giá | Service chưa kiểm tra chủ đơn và đã giao |

Ví dụ: khách A tạo đơn từ TP.HCM đến người nhận; backend thử tạo shipment WAITING. Tài xế B nhận qua accept API thì chuyến chuyển ngay PICKED_UP; B chuyển IN_TRANSIT rồi DELIVERED. Backend thử cộng thu nhập, khách gửi đánh giá. Để luồng này đáng tin cậy cần chỉ một tài xế nhận, kiểm tra quyền sở hữu, chứng minh lấy/giao hàng, đồng bộ order và ghi thu nhập đúng một lần.

Order và shipment có hệ trạng thái riêng; không nên coi chúng tự đồng bộ khi chưa xác minh xuyên luồng.

## Phạm vi vai trò cần bảo đảm

| Vai trò | Phạm vi mong muốn |
| --- | --- |
| ADMIN | Quản trị và giám sát toàn hệ thống |
| WAREHOUSE_MANAGER | Kho, tồn kho, đơn và chuyến thuộc phạm vi phụ trách |
| DRIVER | Chuyến đã nhận/được giao, vị trí và ví của mình |
| CUSTOMER | Đơn, tracking và đánh giá của mình |

Đây là ranh giới nghiệp vụ cần kiểm tra ở backend. Role middleware và menu giao diện chưa chứng minh đã kiểm tra quyền trên từng bản ghi.

## AI thực tế đang làm gì?

- Flask cung cấp `/health`, `/predict-eta`, `/optimize-route`.
- ETA dùng khoảng cách chia tốc độ theo loại xe, điều chỉnh bởi hệ số thời tiết/giao thông và tùy chọn số phút lịch sử. Confidence là điểm theo quy tắc, chưa phải xác suất đã kiểm chứng.
- train_model.py huấn luyện Random Forest trên 500 mẫu tổng hợp và lưu bằng joblib. predict_eta hiện không sử dụng mô hình. R² được in trên chính tập train.
- Tối ưu nhiều điểm dùng thuật toán di truyền, khoảng cách Haversine và tốc độ giả định 50 km/h. Warehouse chưa tham gia hàm mục tiêu; chưa xét tải xe, khung giờ hoặc giao thông trực tiếp.
- Backend có fallback Node khi Python lỗi; các luồng tối ưu đã đọc gửi một điểm giao sang Python nên thường vào nhánh direct.
- Nhãn python_ml trong backend hiện chưa phản ánh đúng cách ETA tính toán.

Đây là nền tảng đang phát triển với nhiều module đã có mã. Chất lượng AI và khả năng vận hành thực tế cần được chứng minh bằng dữ liệu và kiểm thử tích hợp.
