# Smart Logistics & Supply Chain Platform

# Enterprise Software Engineering Graduation Project

---

# 1. Project Overview

## Project Name

**Smart Logistics & Supply Chain Platform**

## Thesis Topic

Thiết kế và xây dựng hệ thống quản lý và điều phối giao vận thời gian thực tích hợp AI tối ưu hóa lộ trình và dự đoán thời gian giao hàng (ETA).

---

# 2. Business Problem

Nhiều doanh nghiệp Logistics hiện nay gặp các vấn đề:

- Quản lý đơn hàng thủ công.
- Không theo dõi được vị trí tài xế theo thời gian thực.
- Không có ETA chính xác.
- Điều phối xe chưa tối ưu.
- Khó quản lý kho và tồn kho.
- Thiếu Dashboard thống kê.
- Phân quyền chưa rõ ràng.

Hệ thống này được xây dựng để giải quyết toàn bộ các vấn đề trên.

---

# 3. Project Objectives

## Functional Objectives

- Authentication bằng JWT.
- Role Based Access Control (RBAC).
- Quản lý khách hàng.
- Quản lý kho.
- Quản lý tồn kho.
- Quản lý sản phẩm.
- Quản lý xe.
- Quản lý tài xế.
- Quản lý tuyến đường.
- Quản lý đơn hàng.
- Quản lý Shipment.
- Theo dõi GPS thời gian thực.
- Dashboard.
- Notification.
- AI ETA Prediction.
- AI Route Optimization.

---

## Non Functional Requirements

- Clean Architecture
- RESTful API
- Repository Pattern
- MVC Architecture
- Socket.IO
- SQL Server
- JWT Authentication
- RBAC
- Swagger API Documentation
- Error Handling
- Logging
- Validation
- Rate Limiting
- Enterprise Folder Structure

---

# 4. System Architecture

```
SmartLogistics/
│
├── backend/
│
├── frontend/
│
├── ai-service/
│
├── database/
│
├── docs/
│
└── README.md
```

---

# 5. Backend Architecture

```
backend/
│
├── src/
│
├── app.js
├── server.js
│
├── config/
│
│   ├── database.js
│   ├── jwt.js
│   ├── socket.js
│   ├── swagger.js
│   └── env.js
│
├── middleware/
│
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   ├── upload.middleware.js
│   ├── error.middleware.js
│   └── notFound.middleware.js
│
├── routes/
│
│   └── index.js
│
├── socket/
│
│   └── tracking.socket.js
│
├── utils/
│
│   ├── logger.js
│   ├── response.js
│   ├── pagination.js
│   ├── hash.js
│   ├── jwt.js
│   ├── validator.js
│   └── helper.js
│
├── uploads/
│
└── modules/
```

---

# 6. Module Architecture

Every module must follow the same structure.

```
module-name/

controller/

service/

repository/

routes/

validation/

dto/

model/

mapper/

constants/

index.js
```

Example

```
orders/

order.controller.js

order.service.js

order.repository.js

order.route.js

order.validation.js

order.dto.js

order.mapper.js

order.constants.js
```

Repository Layer only communicates with SQL Server.

Service Layer contains all business logic.

Controller only handles HTTP Request/Response.

Never put business logic inside controller.

---

# 7. Frontend Architecture

```
frontend/

src/

assets/

components/

contexts/

hooks/

layouts/

pages/

routes/

services/

socket/

store/

utils/

App.jsx

main.jsx
```

---

# 8. AI Service

Python Service

```
ai-service/

app.py

train_model.py

eta_prediction.py

route_optimizer.py

model.pkl

requirements.txt
```

Use Flask or FastAPI.

Provide REST API

POST /predict-eta

POST /optimize-route

---

# 9. Technology Stack

## Backend

Node.js

Express.js

Socket.IO

JWT

bcrypt

Express Validator

MSSQL

Helmet

Compression

CORS

Cookie Parser

Morgan

Swagger

dotenv

---

## Frontend

React

Vite

Tailwind CSS

React Router

Axios

Socket.IO Client

React Hook Form

Chart.js

Leaflet / Google Maps

---

## AI

Python

Flask

Scikit-learn

Pandas

NumPy

Joblib

---

## Database

SQL Server

Stored Procedures

Views

Functions

Triggers

Indexes

---

# 10. User Roles

Admin

Warehouse Manager

Driver

Customer

---

# 11. RBAC

Admin

Full Access

Warehouse Manager

Warehouse

Inventory

Orders

Shipments

Driver

Assigned Shipment

GPS

Update Status

Customer

Own Orders

Track Shipment

ETA

---

# 12. Database Tables

Roles

Permissions

RolePermissions

Users

RefreshTokens

AuditLogs

Customers

CustomerAddresses

Drivers

Vehicles

VehicleMaintenance

Warehouses

WarehouseZones

Products

Categories

Inventory

Orders

OrderItems

Routes

Shipments

ShipmentItems

DriverLocations

TrackingHistory

Notifications

AI_Predictions

DeliveryProofs

SystemSettings

---

# 13. Backend Modules

Auth

Users

Roles

Customers

Drivers

Vehicles

Warehouses

Inventory

Products

Orders

Shipments

Tracking

Notifications

Dashboard

AI

Reports

Settings

---

# 14. API Modules

/auth

/users

/roles

/customers

/drivers

/vehicles

/products

/inventory

/warehouses

/orders

/shipments

/tracking

/notifications

/dashboard

/reports

/settings

/ai

---

# 15. Order Flow

Customer

↓

Create Order

↓

Warehouse Manager

↓

Confirm Order

↓

Create Shipment

↓

Assign Driver

↓

Assign Vehicle

↓

AI Calculate ETA

↓

Driver Accept Shipment

↓

Realtime GPS Tracking

↓

Customer Tracking

↓

Delivered

↓

Completed

---

# 16. Realtime Tracking

Driver Mobile

↓

Socket.IO

↓

Backend

↓

Broadcast

↓

Customer

↓

Dashboard

GPS updates every 5 seconds.

---

# 17. AI Features

## ETA Prediction

Input

Distance

Weather

Traffic

Vehicle Type

Historical Delivery Time

Output

ETA

Confidence Score

---

## Route Optimization

Input

Warehouse

Driver Location

Delivery Points

Traffic

Output

Optimal Route

Delivery Order

Estimated Time

---

# 18. Dashboard

Total Orders

Pending Orders

Completed Orders

Cancelled Orders

Drivers Online

Vehicles Active

Warehouse Capacity

Revenue

Realtime Map

---

# 19. Security

JWT

bcrypt

RBAC

Helmet

Rate Limiter

Input Validation

SQL Injection Protection

XSS Protection

CORS

Refresh Token

Audit Logs

---

# 20. Coding Rules

Always use async/await.

Never use callback.

Never write SQL inside Controller.

Business logic belongs to Service.

Database access belongs to Repository.

Return standard JSON Response.

Use try/catch in every async function.

Every API must have validation.

Every API must have Swagger documentation.

Every module must have:

- Controller
- Service
- Repository
- Validation
- Routes
- DTO

Never duplicate code.

Use reusable helper functions.

---

# 21. Response Format

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

---

# 22. Development Order

1. Config
2. Database Connection
3. Utils
4. Middleware
5. Authentication
6. RBAC
7. Users
8. Customers
9. Warehouses
10. Products
11. Inventory
12. Drivers
13. Vehicles
14. Orders
15. Shipments
16. Tracking
17. Dashboard
18. Notifications
19. AI
20. Swagger
21. Testing
22. Deployment

---

# 23. Future Improvements

Docker

Redis

RabbitMQ

Microservices

Kubernetes

CI/CD

OCR Documents

QR Delivery

Firebase Push Notification

Payment Gateway

Demand Forecast AI

Multi Warehouse

Multi Company

Offline Driver Mobile App