# Hướng dẫn chạy cục bộ

Cần Node.js/npm tương thích package.json, Python có pip, SQL Server có tài khoản kết nối. Chưa xác nhận ma trận phiên bản tương thích toàn bộ dependency.

## Database

Mở `backend/database.md` bằng công cụ chạy T-SQL như SSMS, kiểm tra rồi chạy trên database phát triển riêng. Script chứa CREATE DATABASE, CREATE TABLE và batch GO. Không chạy lại toàn bộ trên database đang có dữ liệu: nhiều CREATE TABLE không có kiểm tra tồn tại. Đối chiếu schema với model trước khi sử dụng.

## Backend

Tạo `backend/.env` với giá trị riêng của máy:

```dotenv
PORT=5000
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=SmartLogistics
DB_USER=your_database_user
DB_PASSWORD=replace_locally
JWT_SECRET=replace_with_a_long_random_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:5001
```

```powershell
cd backend
npm install
npm run dev
```

Backend chỉ mở cổng sau khi SQL Server kết nối thành công. Kiểm tra `http://localhost:5000/api`. `/api-docs` được mount nhưng cấu hình Swagger hiện có lỗi tự import; chưa coi là tài liệu API hoàn chỉnh.

Các script seed-admin.js, seed-driver.js, seed-customer.js có ghi dữ liệu và tài khoản mẫu; đọc trước khi chủ động chạy. Không dùng tài khoản mẫu cho môi trường thật. Lượt rà soát không chạy seed.

## AI service

Terminal riêng tại thư mục gốc:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r ai-service/requirements.txt
.\.venv\Scripts\python.exe ai-service/app.py
```

Có thể dùng lại .venv hiện có nếu phù hợp. Mặc định cổng 5001; AI_PORT đọc từ môi trường terminal, app.py chưa tự load .env. Kiểm tra `http://localhost:5001/health`. Không cần chạy train_model.py cho ETA theo công thức hiện tại.

app.py hiện bật debug và bind 0.0.0.0; cách chạy trên phục vụ phát triển.

## Frontend

Terminal riêng:

```powershell
cd frontend
npm install
npm run dev
```

Mở URL Vite in ra, thường là `http://localhost:5173`. API_BASE đang gắn cứng trong `frontend/src/services/api.js`; SocketContext suy ra địa chỉ backend từ đó. Đổi cổng backend cần cập nhật tương ứng. CLIENT_URL hiện cấu hình CORS của socket, còn HTTP dùng cors() mở rộng.

## Kiểm tra

```powershell
cd frontend
npm run build
npm run lint
```

Backend chưa khai báo script test/lint. Build frontend thành công không chứng minh auth, database, socket và AI chạy đúng.

- Backend không mở cổng: kiểm tra log SQL, tài khoản, TCP/IP và port.
- Không có dữ liệu: kiểm tra API_BASE, token, hồ sơ customer/driver và schema.
- ETA source=node: xem log backend, Python và AI_SERVICE_URL vì đang dùng fallback.
- Bản đồ không ra tuyến: kiểm tra địa chỉ và kết nối nhà cung cấp geocode/routing.
- GPS sai tài xế: Tracking đang gửi driverId=1, cần sửa trước demo nhiều tài xế.
