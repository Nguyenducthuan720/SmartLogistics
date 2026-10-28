# Báo cáo rà soát và thứ tự hoàn thiện

Đối chiếu ngày 28/10/2026. Đây là rà soát tĩnh cấu trúc, cấu hình và các luồng chính, chưa phải kiểm toán bảo mật hoặc kiểm chứng toàn bộ hệ thống với SQL Server.

## Ưu tiên 1: quyền và nhất quán dữ liệu

1. Xác thực socket, suy ra driver từ người đăng nhập, kiểm tra quyền vào room. tracking.socket.js hiện nhận driverId từ client và io.emit vị trí cho mọi kết nối; config/socket.js nhận ID room do client gửi.
2. Kiểm tra ownership ở order, shipment, tracking, review. Order getById tại controller/service đã đọc chưa chặn chủ đơn; review create chưa kiểm tra đơn thuộc khách hoặc đã giao.
3. Sửa lọc order khi khách không có hồ sơ: controller gán customerId=0 nhưng service chuyển 0 thành null, có thể bỏ bộ lọc. Cần trả rỗng hoặc từ chối.
4. Không cho khách tự chọn customerId của khách khác khi tạo đơn; controller hiện ưu tiên req.body.customerId nếu có.
5. Nhận chuyến bằng UPDATE có điều kiện WAITING và DriverID IS NULL, kiểm tra số dòng tác động. SELECT rồi UPDATE riêng hiện có nguy cơ hai tài xế cùng nhận.
6. Đặt transaction phù hợp cho order/items/shipment và tồn kho; tránh order thành công nhưng shipment lỗi âm thầm.
7. Bảo đảm ghi thu nhập đúng một lần, không âm ví khi thao tác đồng thời bằng transaction, constraint và cập nhật có điều kiện. Kiểm tra trước rồi ghi riêng chưa đủ.
8. Xác định ví đang mô phỏng: service deposit/withdraw thay đổi số dư; chưa thấy bằng chứng thanh toán và đối soát ngân hàng trong luồng đã đọc.

## Ưu tiên 2: nghiệp vụ

- Enforce state machine trong service, kiểm tra người thực hiện và dữ liệu mỗi bước. Tách nhận nhiệm vụ khỏi lấy hàng nếu nghiệp vụ cần.
- Đồng bộ order/shipment, xử lý hủy, giao thất bại và hoàn hàng.
- Kiểm tra tải trọng, lịch tài xế/xe và phạm vi kho khi phân công.
- GPS gắn với người đăng nhập, cập nhật theo yêu cầu 5 giây, xử lý mất mạng và chỉ phát cho người có quyền. Tracking hiện gửi thủ công và gắn driverId=1.
- Lưu bằng chứng giao, đối soát và xác nhận 12% TotalAmount là đúng chính sách; cần phân biệt giá hàng với cước vận chuyển.
- Chuẩn hóa repository, DTO, validation và lỗi theo AGENTS.md; đưa nghiệp vụ và truy cập model khỏi controller.

## Ưu tiên 3: AI

- Đổi nhãn ETA heuristic cho đúng hoặc nối mô hình đã train vào predict_eta.
- Đồng nhất lưu/đọc: train_model dùng joblib.dump, load_model dùng pickle.load; hàm dự đoán hiện chưa gọi loader.
- Sửa estimated_hours nhất quán với estimated_minutes khi phối hợp historical_minutes; chuẩn hóa timezone cho predicted_eta.
- Validate số hữu hạn, khoảng cách không âm, loại xe, thời tiết, traffic, tọa độ và kích thước danh sách. Input lỗi của Flask hiện có thể rơi về 500.
- Kiểm tra crossover khi điểm giao trùng; giữ ID từng điểm qua kết quả tối ưu.
- Tối ưu thực sự nhiều điểm, dùng đường thực và ràng buộc vận hành; kiểm chứng chất lượng với baseline.
- Train/test trên dữ liệu thực, báo cáo MAE/RMSE. Confidence hiện là quy tắc chưa được hiệu chỉnh.

## Ưu tiên 4: cấu hình và kiểm thử

- Sửa config/swagger.js tự require chính ./swagger; cần definition OpenAPI thật và tài liệu cho toàn bộ route.
- API_BASE frontend nên đọc cấu hình môi trường; kiểm soát HTTP CORS, bỏ secret JWT mặc định và tắt Flask debug khi triển khai.
- Migration có phiên bản và seed demo kiểm soát được.
- Kiểm thử tích hợp: hai khách tách dữ liệu, hai tài xế nhận cùng chuyến, chuyển trạng thái sai, DELIVERED lặp, ví và fallback AI.
- Thêm CI và hướng dẫn triển khai sau khi ổn định luồng chính.

## Thay đổi trong lượt rà soát

Đã tạo README tổng, tài liệu kiến trúc/quy trình, hướng dẫn chạy và báo cáo này. Không sửa AGENTS.md, API, dữ liệu hoặc chạy seed. Những vấn đề phía trên là công việc còn lại, không phải lỗi đã được sửa trong lượt này.
