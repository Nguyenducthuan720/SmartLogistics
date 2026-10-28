/*===========================================================
    SMART LOGISTICS DATABASE
    PART 1 - AUTHENTICATION & AUTHORIZATION
===========================================================*/

IF DB_ID('SmartLogistics') IS NULL
BEGIN
    CREATE DATABASE SmartLogistics;
END
GO

USE SmartLogistics;
GO

/*===========================================================
    ROLES
===========================================================*/
CREATE TABLE Roles
(
    RoleID INT IDENTITY(1,1) PRIMARY KEY,

    RoleName NVARCHAR(50) NOT NULL UNIQUE,

    Description NVARCHAR(255),

    IsActive BIT NOT NULL DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    UpdatedAt DATETIME2
);
GO

/*===========================================================
    PERMISSIONS
===========================================================*/
CREATE TABLE Permissions
(
    PermissionID INT IDENTITY(1,1) PRIMARY KEY,

    PermissionName NVARCHAR(100) NOT NULL UNIQUE,

    Description NVARCHAR(255),

    ModuleName NVARCHAR(100),

    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

/*===========================================================
    ROLE PERMISSIONS
===========================================================*/
CREATE TABLE RolePermissions
(
    RolePermissionID INT IDENTITY(1,1) PRIMARY KEY,

    RoleID INT NOT NULL,

    PermissionID INT NOT NULL,

    CONSTRAINT FK_RolePermissions_Role
        FOREIGN KEY(RoleID)
        REFERENCES Roles(RoleID)
        ON DELETE CASCADE,

    CONSTRAINT FK_RolePermissions_Permission
        FOREIGN KEY(PermissionID)
        REFERENCES Permissions(PermissionID)
        ON DELETE CASCADE,

    CONSTRAINT UQ_RolePermission UNIQUE(RoleID, PermissionID)
);
GO

/*===========================================================
    USERS
===========================================================*/
CREATE TABLE Users
(
    UserID INT IDENTITY(1,1) PRIMARY KEY,

    RoleID INT NOT NULL,

    FullName NVARCHAR(150) NOT NULL,

    Username NVARCHAR(50) NOT NULL UNIQUE,

    Email NVARCHAR(150) NOT NULL UNIQUE,

    PasswordHash NVARCHAR(255) NOT NULL,

    Phone NVARCHAR(20),

    Avatar NVARCHAR(255),

    Gender NVARCHAR(10),

    DateOfBirth DATE,

    Address NVARCHAR(255),

    IsVerified BIT DEFAULT 0,

    IsLocked BIT DEFAULT 0,

    IsActive BIT DEFAULT 1,

    LastLogin DATETIME2,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    UpdatedAt DATETIME2,

    CONSTRAINT FK_Users_Role
        FOREIGN KEY(RoleID)
        REFERENCES Roles(RoleID)
);
GO

/*===========================================================
    REFRESH TOKENS
===========================================================*/
CREATE TABLE RefreshTokens
(
    RefreshTokenID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NOT NULL,

    Token NVARCHAR(MAX) NOT NULL,

    ExpiredAt DATETIME2 NOT NULL,

    IsRevoked BIT DEFAULT 0,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_RefreshTokens_User
        FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);
GO

/*===========================================================
    AUDIT LOGS
===========================================================*/
CREATE TABLE AuditLogs
(
    AuditLogID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NULL,

    Action NVARCHAR(100) NOT NULL,

    Module NVARCHAR(100),

    Description NVARCHAR(MAX),

    IPAddress NVARCHAR(50),

    UserAgent NVARCHAR(500),

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_AuditLogs_User
        FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
);
GO
CREATE TABLE Customers
(
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT UNIQUE NOT NULL,

    CompanyName NVARCHAR(150),

    TaxCode NVARCHAR(30),

    ContactPerson NVARCHAR(150),

    CustomerType NVARCHAR(30) DEFAULT 'INDIVIDUAL',

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    UpdatedAt DATETIME2,

    CONSTRAINT FK_Customers_User
        FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
);
GO
CREATE TABLE CustomerAddresses
(
    AddressID INT IDENTITY(1,1) PRIMARY KEY,

    CustomerID INT NOT NULL,

    AddressType NVARCHAR(30) DEFAULT 'DELIVERY',

    Address NVARCHAR(255),

    Province NVARCHAR(100),

    District NVARCHAR(100),

    Latitude DECIMAL(10,6),

    Longitude DECIMAL(10,6),

    IsDefault BIT DEFAULT 0,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_CustomerAddresses_Customer
        FOREIGN KEY(CustomerID)
        REFERENCES Customers(CustomerID)
        ON DELETE CASCADE
);
GO
CREATE TABLE Warehouses
(
    WarehouseID INT IDENTITY(1,1) PRIMARY KEY,

    WarehouseName NVARCHAR(150) NOT NULL,

    Phone NVARCHAR(20),

    Email NVARCHAR(150),

    Province NVARCHAR(100),

    District NVARCHAR(100),

    Address NVARCHAR(255),

    Latitude DECIMAL(10,6),

    Longitude DECIMAL(10,6),

    Capacity INT,

    Status NVARCHAR(30) DEFAULT 'ACTIVE',

    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO
CREATE TABLE WarehouseZones
(
    ZoneID INT IDENTITY(1,1) PRIMARY KEY,

    WarehouseID INT NOT NULL,

    ZoneCode NVARCHAR(50),

    ZoneName NVARCHAR(100),

    Description NVARCHAR(255),

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_WarehouseZones_Warehouse
        FOREIGN KEY(WarehouseID)
        REFERENCES Warehouses(WarehouseID)
        ON DELETE CASCADE
);
GO
CREATE TABLE Categories
(
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,

    CategoryName NVARCHAR(100) NOT NULL UNIQUE,

    Description NVARCHAR(255),

    IsActive BIT DEFAULT 1,

    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO
CREATE TABLE Products
(
    ProductID INT IDENTITY(1,1) PRIMARY KEY,

    CategoryID INT NOT NULL,

    ProductCode NVARCHAR(50) UNIQUE,

    ProductName NVARCHAR(200) NOT NULL,

    Description NVARCHAR(MAX),

    Weight DECIMAL(10,2),

    Length DECIMAL(10,2),

    Width DECIMAL(10,2),

    Height DECIMAL(10,2),

    Unit NVARCHAR(20),

    Price DECIMAL(18,2),

    ImageUrl NVARCHAR(255),

    IsActive BIT DEFAULT 1,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Products_Category
        FOREIGN KEY(CategoryID)
        REFERENCES Categories(CategoryID)
);
GO
CREATE TABLE Inventory
(
    InventoryID INT IDENTITY(1,1) PRIMARY KEY,

    WarehouseID INT NOT NULL,

    ZoneID INT NULL,

    ProductID INT NOT NULL,

    Quantity INT NOT NULL DEFAULT 0,

    ReservedQuantity INT DEFAULT 0,

    MinQuantity INT DEFAULT 0,

    MaxQuantity INT DEFAULT 0,

    LastUpdated DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Inventory_Warehouse
        FOREIGN KEY(WarehouseID)
        REFERENCES Warehouses(WarehouseID),

    CONSTRAINT FK_Inventory_Zone
        FOREIGN KEY(ZoneID)
        REFERENCES WarehouseZones(ZoneID),

    CONSTRAINT FK_Inventory_Product
        FOREIGN KEY(ProductID)
        REFERENCES Products(ProductID),

    CONSTRAINT UQ_Inventory
        UNIQUE(WarehouseID, ZoneID, ProductID)
);
GO
CREATE TABLE Drivers
(
    DriverID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NOT NULL UNIQUE,

    LicenseNumber NVARCHAR(50) NOT NULL UNIQUE,

    LicenseType NVARCHAR(50),

    LicenseExpiry DATE,

    Status NVARCHAR(30) DEFAULT 'AVAILABLE',

    CurrentLatitude DECIMAL(10,6),

    CurrentLongitude DECIMAL(10,6),

    Rating DECIMAL(3,2) DEFAULT 5,

    TotalTrips INT DEFAULT 0,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    UpdatedAt DATETIME2,

    CONSTRAINT FK_Drivers_User
        FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
);
GO
CREATE TABLE Vehicles
(
    VehicleID INT IDENTITY(1,1) PRIMARY KEY,

    DriverID INT NULL,

    LicensePlate NVARCHAR(20) UNIQUE NOT NULL,

    VehicleType NVARCHAR(50),

    Brand NVARCHAR(100),

    Model NVARCHAR(100),

    CapacityWeight DECIMAL(10,2),

    CapacityVolume DECIMAL(10,2),

    FuelType NVARCHAR(30),

    Status NVARCHAR(30) DEFAULT 'AVAILABLE',

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    UpdatedAt DATETIME2,

    CONSTRAINT FK_Vehicles_Driver
        FOREIGN KEY(DriverID)
        REFERENCES Drivers(DriverID)
);
GO
CREATE TABLE Routes
(
    RouteID INT IDENTITY(1,1) PRIMARY KEY,

    RouteCode NVARCHAR(30) UNIQUE,

    StartProvince NVARCHAR(100),

    EndProvince NVARCHAR(100),

    DistanceKM DECIMAL(10,2),

    EstimatedHours DECIMAL(10,2),

    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO
CREATE TABLE Orders
(
    OrderID INT IDENTITY(1,1) PRIMARY KEY,

    OrderCode NVARCHAR(30) UNIQUE NOT NULL,

    CustomerID INT NOT NULL,

    PickupAddress NVARCHAR(255),

    DeliveryAddress NVARCHAR(255),

    PickupProvince NVARCHAR(100),

    DeliveryProvince NVARCHAR(100),

    OrderStatus NVARCHAR(30) DEFAULT 'PENDING',

    TotalWeight DECIMAL(10,2),

    TotalAmount DECIMAL(18,2),

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    UpdatedAt DATETIME2,

    CONSTRAINT FK_Orders_Customer
        FOREIGN KEY(CustomerID)
        REFERENCES Customers(CustomerID)
);
GO
CREATE TABLE OrderItems
(
    OrderItemID INT IDENTITY(1,1) PRIMARY KEY,

    OrderID INT NOT NULL,

    ProductID INT NOT NULL,

    Quantity INT NOT NULL,

    Weight DECIMAL(10,2),

    Price DECIMAL(18,2),

    CONSTRAINT FK_OrderItems_Order
        FOREIGN KEY(OrderID)
        REFERENCES Orders(OrderID)
        ON DELETE CASCADE,

    CONSTRAINT FK_OrderItems_Product
        FOREIGN KEY(ProductID)
        REFERENCES Products(ProductID)
);
GO
CREATE TABLE Shipments
(
    ShipmentID INT IDENTITY(1,1) PRIMARY KEY,

    OrderID INT NOT NULL UNIQUE,

    DriverID INT,

    VehicleID INT,

    RouteID INT,

    WarehouseID INT,

    ShipmentStatus NVARCHAR(30) DEFAULT 'WAITING',

    StartTime DATETIME2,

    EndTime DATETIME2,

    EstimatedArrival DATETIME2,

    ActualArrival DATETIME2,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Shipments_Order
        FOREIGN KEY(OrderID)
        REFERENCES Orders(OrderID),

    CONSTRAINT FK_Shipments_Driver
        FOREIGN KEY(DriverID)
        REFERENCES Drivers(DriverID),

    CONSTRAINT FK_Shipments_Vehicle
        FOREIGN KEY(VehicleID)
        REFERENCES Vehicles(VehicleID),

    CONSTRAINT FK_Shipments_Route
        FOREIGN KEY(RouteID)
        REFERENCES Routes(RouteID),

    CONSTRAINT FK_Shipments_Warehouse
        FOREIGN KEY(WarehouseID)
        REFERENCES Warehouses(WarehouseID)
);
GO
CREATE TABLE ShipmentItems
(
    ShipmentItemID INT IDENTITY(1,1) PRIMARY KEY,

    ShipmentID INT NOT NULL,

    ProductID INT NOT NULL,

    Quantity INT NOT NULL,

    CONSTRAINT FK_ShipmentItems_Shipment
        FOREIGN KEY(ShipmentID)
        REFERENCES Shipments(ShipmentID)
        ON DELETE CASCADE,

    CONSTRAINT FK_ShipmentItems_Product
        FOREIGN KEY(ProductID)
        REFERENCES Products(ProductID)
);
GO
CREATE TABLE DriverLocations
(
    LocationID INT IDENTITY(1,1) PRIMARY KEY,

    DriverID INT NOT NULL,

    Latitude DECIMAL(10,6) NOT NULL,

    Longitude DECIMAL(10,6) NOT NULL,

    Speed DECIMAL(10,2),

    Heading DECIMAL(10,2),

    Accuracy DECIMAL(10,2),

    RecordedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_DriverLocations_Driver
        FOREIGN KEY (DriverID)
        REFERENCES Drivers(DriverID)
        ON DELETE CASCADE
);
GO
CREATE TABLE TrackingHistory
(
    TrackingID INT IDENTITY(1,1) PRIMARY KEY,

    ShipmentID INT NOT NULL,

    Status NVARCHAR(50) NOT NULL,

    Description NVARCHAR(255),

    Latitude DECIMAL(10,6),

    Longitude DECIMAL(10,6),

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_TrackingHistory_Shipment
        FOREIGN KEY(ShipmentID)
        REFERENCES Shipments(ShipmentID)
        ON DELETE CASCADE
);
GO
CREATE TABLE Notifications
(
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NOT NULL,

    Title NVARCHAR(200),

    Message NVARCHAR(MAX),

    Type NVARCHAR(30),

    IsRead BIT DEFAULT 0,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Notifications_User
        FOREIGN KEY(UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
);
GO
CREATE TABLE AI_Predictions
(
    PredictionID INT IDENTITY(1,1) PRIMARY KEY,

    ShipmentID INT NOT NULL,

    PredictedETA DATETIME2,

    PredictedDistance DECIMAL(10,2),

    TrafficLevel NVARCHAR(30),

    Weather NVARCHAR(50),

    ConfidenceScore DECIMAL(5,2),

    ModelVersion NVARCHAR(50),

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_AI_Shipment
        FOREIGN KEY(ShipmentID)
        REFERENCES Shipments(ShipmentID)
        ON DELETE CASCADE
);
GO
CREATE TABLE VehicleMaintenance
(
    MaintenanceID INT IDENTITY(1,1) PRIMARY KEY,

    VehicleID INT NOT NULL,

    MaintenanceType NVARCHAR(100),

    Description NVARCHAR(MAX),

    Cost DECIMAL(18,2),

    MaintenanceDate DATE,

    NextMaintenanceDate DATE,

    GarageName NVARCHAR(200),

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Maintenance_Vehicle
        FOREIGN KEY(VehicleID)
        REFERENCES Vehicles(VehicleID)
        ON DELETE CASCADE
);
GO
CREATE TABLE DeliveryProofs
(
    ProofID INT IDENTITY(1,1) PRIMARY KEY,

    ShipmentID INT NOT NULL,

    ReceiverName NVARCHAR(150),

    SignatureImage NVARCHAR(255),

    DeliveryPhoto NVARCHAR(255),

    Note NVARCHAR(MAX),

    DeliveredAt DATETIME2,

    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_DeliveryProof_Shipment
        FOREIGN KEY(ShipmentID)
        REFERENCES Shipments(ShipmentID)
        ON DELETE CASCADE
);
GO
CREATE TABLE SystemSettings
(
    SettingID INT IDENTITY(1,1) PRIMARY KEY,

    SettingKey NVARCHAR(100) UNIQUE,

    SettingValue NVARCHAR(MAX),

    Description NVARCHAR(255),

    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

/*===========================================================
    DRIVER WALLETS (simulated banking) + REVIEWS
===========================================================*/
CREATE TABLE DriverWallets
(
    WalletID INT IDENTITY(1,1) PRIMARY KEY,
    DriverID INT NOT NULL UNIQUE,
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    BankName NVARCHAR(100),
    BankAccountNumber NVARCHAR(50),
    AccountHolder NVARCHAR(150),
    IsLinked BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,

    CONSTRAINT FK_DriverWallets_Driver
        FOREIGN KEY(DriverID)
        REFERENCES Drivers(DriverID)
        ON DELETE CASCADE
);
GO

CREATE TABLE WalletTransactions
(
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    WalletID INT NOT NULL,
    DriverID INT NOT NULL,
    Type NVARCHAR(20) NOT NULL,          -- EARN, DEPOSIT, WITHDRAW, PAYOUT, ADJUST
    Amount DECIMAL(18,2) NOT NULL,
    BalanceAfter DECIMAL(18,2) NOT NULL,
    Description NVARCHAR(255),
    ReferenceID INT NULL,
    Status NVARCHAR(20) DEFAULT 'COMPLETED',
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_WalletTransactions_Wallet
        FOREIGN KEY(WalletID)
        REFERENCES DriverWallets(WalletID)
        ON DELETE CASCADE
);
GO

CREATE TABLE DriverEarnings
(
    EarningID INT IDENTITY(1,1) PRIMARY KEY,
    ShipmentID INT NOT NULL,
    DriverID INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',   -- PENDING, PAID
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    PaidAt DATETIME2,

    CONSTRAINT FK_DriverEarnings_Shipment
        FOREIGN KEY(ShipmentID)
        REFERENCES Shipments(ShipmentID)
        ON DELETE CASCADE,
    CONSTRAINT FK_DriverEarnings_Driver
        FOREIGN KEY(DriverID)
        REFERENCES Drivers(DriverID)
        ON DELETE CASCADE
);
GO

CREATE INDEX IX_WalletTransactions_Wallet ON WalletTransactions(WalletID);
CREATE INDEX IX_DriverEarnings_Driver ON DriverEarnings(DriverID);
GO

CREATE TABLE Reviews
(
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    ShipmentID INT NOT NULL,
    CustomerID INT NOT NULL,
    DriverID INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Reviews_Shipment
        FOREIGN KEY(ShipmentID)
        REFERENCES Shipments(ShipmentID)
        ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Customer
        FOREIGN KEY(CustomerID)
        REFERENCES Customers(CustomerID)
        ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Driver
        FOREIGN KEY(DriverID)
        REFERENCES Drivers(DriverID)
        ON DELETE CASCADE,
    CONSTRAINT UQ_Review_Shipment UNIQUE(ShipmentID)
);
GO

CREATE INDEX IX_Reviews_Driver ON Reviews(DriverID);
CREATE INDEX IX_Reviews_Customer ON Reviews(CustomerID);
GO

CREATE VIEW vw_DriverRating AS
SELECT
    d.DriverID,
    ISNULL(AVG(CAST(r.Rating AS DECIMAL(3,2))), 0) AS AvgRating,
    COUNT(r.ReviewID) AS ReviewCount
FROM Drivers d
LEFT JOIN Reviews r ON d.DriverID = r.DriverID
GROUP BY d.DriverID;
GO

INSERT INTO SystemSettings
(
SettingKey,
SettingValue,
Description
)
VALUES

('DEFAULT_LANGUAGE','vi','System Language'),

('MAX_LOGIN_FAILED','5','Maximum Login Failed'),

('TRACKING_INTERVAL','5','Tracking every 5 seconds'),

('AI_MODEL','ETA_MODEL_V1','Current AI Model');
GO
INSERT INTO Roles(RoleName, Description)
VALUES
('ADMIN','System Administrator'),
('WAREHOUSE_MANAGER','Warehouse Manager'),
('DRIVER','Driver'),
('CUSTOMER','Customer');
GO
INSERT INTO Users (RoleID, FullName, Username, Email, PasswordHash, Phone)
VALUES
(1, N'Admin User', N'admin', N'admin@smartlogistics.com', N'hashed_password', N'0900000000');
GO
INSERT INTO Permissions(PermissionName, ModuleName)
VALUES

('USER_VIEW','Users'),
('USER_CREATE','Users'),
('USER_UPDATE','Users'),
('USER_DELETE','Users'),

('ORDER_VIEW','Orders'),
('ORDER_CREATE','Orders'),
('ORDER_UPDATE','Orders'),
('ORDER_DELETE','Orders'),

('WAREHOUSE_VIEW','Warehouse'),
('WAREHOUSE_UPDATE','Warehouse'),

('DRIVER_VIEW','Driver'),
('DRIVER_UPDATE','Driver'),

('TRACKING_VIEW','Tracking'),
('TRACKING_UPDATE','Tracking'),

('REPORT_VIEW','Dashboard');
GO
/* ADMIN có toàn bộ quyền */
INSERT INTO RolePermissions(RoleID, PermissionID)
SELECT
    1,
    PermissionID
FROM Permissions;
GO
INSERT INTO Categories(CategoryName)
VALUES
('Electronics'),
('Furniture'),
('Food'),
('Fashion'),
('Documents'),
('Medicine');
GO
INSERT INTO Products
(
CategoryID,
ProductCode,
ProductName,
Weight,
Price,
Unit
)
VALUES

(1,'P0001','Laptop Dell',2.5,25000000,'Piece'),

(1,'P0002','iPhone 16',0.5,30000000,'Piece'),

(2,'P0003','Office Chair',12,1800000,'Piece'),

(3,'P0004','Instant Noodles Box',5,150000,'Box');
GO
INSERT INTO Warehouses
(
WarehouseName,
Phone,
Province,
District,
Address,
Capacity
)
VALUES

('Ho Chi Minh Warehouse',
'0901111111',
'Ho Chi Minh',
'Thu Duc',
'Vo Van Ngan',
100000),

('Ha Noi Warehouse',
'0902222222',
'Ha Noi',
'Cau Giay',
'Tran Thai Tong',
80000);
GO
INSERT INTO WarehouseZones
(
WarehouseID,
ZoneCode,
ZoneName
)
VALUES

(1,'A01','Electronics'),

(1,'A02','Food'),

(2,'B01','Furniture');
GO
INSERT INTO Inventory
(
WarehouseID,
ZoneID,
ProductID,
Quantity,
MinQuantity,
MaxQuantity
)
VALUES

(1,1,1,50,10,200),

(1,1,2,70,10,150),

(2,3,3,40,5,80),

(1,2,4,100,20,300);
GO
INSERT INTO Drivers
(
UserID,
LicenseNumber,
LicenseType
)
VALUES
(1,'B2-000001','B2');
GO
INSERT INTO Vehicles
(
DriverID,
LicensePlate,
VehicleType,
Brand,
CapacityWeight
)
VALUES
(1,'51A-12345','Truck','Hyundai',5000);
GO
INSERT INTO Routes
(
RouteCode,
StartProvince,
EndProvince,
DistanceKM,
EstimatedHours
)
VALUES
('HCM-HN',
'Ho Chi Minh',
'Ha Noi',
1710,
32),

('HCM-DN',
'Ho Chi Minh',
'Da Nang',
960,
18);
GO
INSERT INTO Customers (UserID, CompanyName, ContactPerson, CustomerType)
VALUES
(1, N'Test Company', N'Admin User', 'INDIVIDUAL');
GO
INSERT INTO Orders (OrderCode, CustomerID, PickupAddress, DeliveryAddress, PickupProvince, DeliveryProvince, TotalWeight, TotalAmount)
VALUES
('ORD0001', 1, N'123 Pickup St', N'456 Delivery St', N'Ho Chi Minh', N'Ha Noi', 10.5, 5000000);
GO
INSERT INTO Shipments (OrderID, DriverID, VehicleID, RouteID, WarehouseID, ShipmentStatus)
VALUES
(1, 1, 1, 1, 1, 'PENDING');
GO
INSERT INTO TrackingHistory
(
ShipmentID,
Status,
Description
)
VALUES

(1,'PENDING','Shipment Created'),

(1,'PICKED_UP','Driver Picked Up Goods');
GO
INSERT INTO Notifications
(
UserID,
Title,
Message,
Type
)
VALUES

(1,
'Welcome',
'Welcome to Smart Logistics',
'SYSTEM');
GO
CREATE INDEX IX_Users_Email
ON Users(Email);
GO

CREATE INDEX IX_Users_Username
ON Users(Username);
GO
CREATE INDEX IX_Orders_OrderCode
ON Orders(OrderCode);
GO

CREATE INDEX IX_Orders_Status
ON Orders(OrderStatus);
GO

CREATE INDEX IX_Orders_Customer
ON Orders(CustomerID);
GO
CREATE INDEX IX_DriverLocations_Driver
ON DriverLocations(DriverID);
GO

CREATE INDEX IX_DriverLocations_Time
ON DriverLocations(RecordedAt);
GO
CREATE INDEX IX_Inventory_Product
ON Inventory(ProductID);
GO

CREATE INDEX IX_Inventory_Warehouse
ON Inventory(WarehouseID);
GO
CREATE VIEW vw_OrderSummary
AS

SELECT

OrderStatus,

COUNT(*) AS TotalOrders

FROM Orders

GROUP BY OrderStatus;
GO
CREATE VIEW vw_DriverStatistics
AS

SELECT

d.DriverID,

u.FullName,

d.TotalTrips,

d.Rating,

v.LicensePlate

FROM Drivers d

JOIN Users u
ON d.UserID=u.UserID

LEFT JOIN Vehicles v
ON d.DriverID=v.DriverID;
GO
CREATE VIEW vw_WarehouseInventory
AS

SELECT

w.WarehouseName,

p.ProductName,

i.Quantity

FROM Inventory i

JOIN Warehouses w

ON i.WarehouseID=w.WarehouseID

JOIN Products p

ON i.ProductID=p.ProductID;
GO
CREATE VIEW vw_ShipmentDetail
AS

SELECT

s.ShipmentID,

o.OrderCode,

u.FullName AS Driver,

v.LicensePlate,

s.ShipmentStatus

FROM Shipments s

JOIN Orders o

ON s.OrderID=o.OrderID

LEFT JOIN Drivers d

ON s.DriverID=d.DriverID

LEFT JOIN Users u

ON d.UserID=u.UserID

LEFT JOIN Vehicles v

ON s.VehicleID=v.VehicleID;
GO
CREATE FUNCTION fn_TotalOrderAmount
(

@OrderID INT

)

RETURNS DECIMAL(18,2)

AS

BEGIN

DECLARE @Total DECIMAL(18,2)

SELECT

@Total=SUM(Quantity*Price)

FROM OrderItems

WHERE OrderID=@OrderID

RETURN ISNULL(@Total,0)

END
GO
CREATE FUNCTION fn_TotalWeight
(

@OrderID INT

)

RETURNS DECIMAL(18,2)

AS

BEGIN

DECLARE @Weight DECIMAL(18,2)

SELECT

@Weight=SUM(Quantity*Weight)

FROM OrderItems

WHERE OrderID=@OrderID

RETURN ISNULL(@Weight,0)

END
GO
CREATE PROCEDURE sp_GetOrders

AS

BEGIN

SELECT *

FROM Orders

ORDER BY CreatedAt DESC

END
GO
CREATE PROCEDURE sp_GetOrderByCode

@OrderCode NVARCHAR(30)

AS

BEGIN

SELECT *

FROM Orders

WHERE OrderCode=@OrderCode

END
GO
CREATE PROCEDURE sp_UpdateShipmentStatus

@ShipmentID INT,

@Status NVARCHAR(30)

AS

BEGIN

UPDATE Shipments

SET ShipmentStatus=@Status

WHERE ShipmentID=@ShipmentID

END
GO
CREATE PROCEDURE sp_AssignDriver

@ShipmentID INT,

@DriverID INT

AS

BEGIN

UPDATE Shipments

SET DriverID=@DriverID

WHERE ShipmentID=@ShipmentID

END
GO
CREATE PROCEDURE sp_AssignVehicle

@ShipmentID INT,

@VehicleID INT

AS

BEGIN

UPDATE Shipments

SET VehicleID=@VehicleID

WHERE ShipmentID=@ShipmentID

END
GO
CREATE TRIGGER trg_UpdateOrderStatus

ON Shipments

AFTER UPDATE

AS

BEGIN

UPDATE Orders

SET OrderStatus='DELIVERED'

FROM Orders o

JOIN inserted i

ON o.OrderID=i.OrderID

WHERE i.ShipmentStatus='DELIVERED'

END
GO
CREATE TRIGGER trg_SaveTracking

ON Shipments

AFTER UPDATE

AS

BEGIN

INSERT INTO TrackingHistory

(

ShipmentID,

Status,

Description

)

SELECT

ShipmentID,

ShipmentStatus,

'Status Changed'

FROM inserted

END
GO
CREATE TRIGGER trg_AuditOrder

ON Orders

AFTER INSERT

AS

BEGIN

INSERT INTO AuditLogs

(

UserID,

Action,

Module,

Description

)

SELECT

1,

'CREATE',

'ORDER',

'New Order Created'

END
GO
EXEC sp_GetOrders
EXEC sp_GetOrderByCode 'ORD0001'
SELECT * FROM Orders;

SELECT COUNT(*) FROM Orders;