// UI contract fixture derived from backend controllers/models. No real credentials or SQL.
const http=require("http");
const seed={
 orders:[{OrderID:1,OrderCode:"ORD-2047",CustomerName:"Minh Anh",CustomerID:1,OrderStatus:"SHIPPING",TotalAmount:1250000,PickupAddress:"12 Đường số 8, Thủ Đức",DeliveryAddress:"86 Nguyễn Huệ, Quận 1",PickupProvince:"TP.HCM",DeliveryProvince:"TP.HCM",ShipmentID:1,CreatedAt:"2026-10-28T02:15:00Z",items:[{ProductID:1,ProductName:"Thùng hàng gia dụng",Quantity:2,Weight:5,Price:150000}]}],
 shipments:[{ShipmentID:1,OrderID:1,OrderCode:"ORD-2047",ShipmentStatus:"IN_TRANSIT",DriverID:1,DriverName:"Trần Minh",LicensePlate:"51C-123.45",WarehouseName:"Kho Thủ Đức",RouteCode:"RT-01",PickupAddress:"12 Đường số 8, Thủ Đức",DeliveryAddress:"86 Nguyễn Huệ, Quận 1",CreatedAt:"2026-10-28T02:15:00Z"}],
 inventory:[{InventoryID:1,WarehouseID:1,ProductID:1,ProductCode:"GD-001",ProductName:"Thùng hàng gia dụng",WarehouseName:"Kho Thủ Đức",ZoneName:"A-02",Quantity:245,ReservedQuantity:20}],
 warehouses:[{WarehouseID:1,WarehouseCode:"WH-01",WarehouseName:"Kho Thủ Đức",Address:"12 Đường số 8",District:"Thủ Đức",Province:"TP.HCM",Capacity:1500,Status:"ACTIVE",ProductCount:1,TotalQuantity:245}],
 products:[{ProductID:1,ProductCode:"GD-001",ProductName:"Thùng hàng gia dụng",CategoryID:1,CategoryName:"Gia dụng",Weight:5,Price:150000,Unit:"Thùng"}],
 customers:[{CustomerID:1,UserID:3,FullName:"Minh Anh",Email:"customer@example.test",UserPhone:"0901234567",CustomerType:"INDIVIDUAL"}],
 drivers:[{DriverID:1,UserID:2,FullName:"Trần Minh",LicensePlate:"51C-123.45",LicenseNumber:"C-001",LicenseType:"C",Status:"AVAILABLE",Rating:4.9,TotalTrips:124}],
 vehicles:[{VehicleID:1,LicensePlate:"51C-123.45",VehicleType:"Truck",Brand:"Isuzu",CapacityWeight:1500,DriverName:"Trần Minh",Status:"AVAILABLE"}],
 settings:[{SettingID:1,SettingKey:"company_name",SettingValue:"SmartLogistics Việt Nam",Description:"Tên doanh nghiệp"}],
 notifications:[{NotificationID:1,Title:"Đơn hàng đang giao",Message:"ORD-2047 đang trên đường đến người nhận.",IsRead:false,CreatedAt:"2026-10-28T02:15:00Z"}],
 roles:[{RoleID:1,RoleName:"ADMIN",IsActive:true,CreatedAt:"2026-10-01T00:00:00Z"}],
 users:[{UserID:1,FullName:"Nguyễn Thuận",Email:"admin@example.test",RoleID:1,RoleName:"ADMIN",IsActive:true,IsLocked:false}]
};
const profiles={ADMIN:{UserID:1,FullName:"Nguyễn Thuận",RoleName:"ADMIN",Email:"admin@example.test"},WAREHOUSE_MANAGER:{UserID:4,FullName:"Lê Hương",RoleName:"WAREHOUSE_MANAGER"},DRIVER:{UserID:2,FullName:"Trần Minh",RoleName:"DRIVER"},CUSTOMER:{UserID:3,FullName:"Minh Anh",RoleName:"CUSTOMER"}};
http.createServer(async(req,res)=>{
 const url=new URL(req.url,"http://localhost"),p=url.pathname.replace(/^\/api/,""),m=req.method;
 res.setHeader("Access-Control-Allow-Origin",req.headers.origin||"*");
 res.setHeader("Access-Control-Allow-Headers","authorization,content-type,x-mock-session");
 res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
 const send=(data,status=200,extra={})=>{res.writeHead(status,{"Content-Type":"application/json"});res.end(JSON.stringify({success:status<400,message:status<400?"Success":String(data),data:status<400?data:null,...extra}));};
 if(m==="OPTIONS"){res.writeHead(204);return res.end();}
 let state=await pm.state.get("smartlogistics-ui");
 if(!state){state=JSON.parse(JSON.stringify(seed));await pm.state.set("smartlogistics-ui",state);}
 const save=()=>pm.state.set("smartlogistics-ui",state);
 const body=req.body||{};
 const role=(req.headers.authorization||"").replace("Bearer ","").replace("fixture-","");
 if(p==="/auth/login"&&m==="POST"){const r={admin:"ADMIN",driver:"DRIVER",customer:"CUSTOMER",warehouse:"WAREHOUSE_MANAGER"}[body.login];if(!r||body.password!=="fixture-password")return send("Thông tin đăng nhập không hợp lệ",401);return send({accessToken:"fixture-"+r,refreshToken:"fixture-refresh",user:{...profiles[r],role:r}});}
 if(p==="/auth/register"&&m==="POST")return send({UserID:10},201);
 if(p==="/auth/logout"&&m==="POST")return send(null);
 if(p==="/auth/profile")return profiles[role]?send({...profiles[role],Role:role}):send("Unauthenticated",401);
 if(!profiles[role])return send("Unauthenticated",401);
 if(p==="/__reset"&&m==="POST"){await pm.state.set("smartlogistics-ui",seed);return send(null);}
 if(p==="/dashboard/stats")return send({orderStats:[{OrderStatus:"SHIPPING",Total:1}],shipmentStats:[{ShipmentStatus:state.shipments[0].ShipmentStatus,Total:1}],driverStats:[{Status:"AVAILABLE",Total:1}],vehicleStats:[{Status:"AVAILABLE",Total:1}],totalWarehouses:1,totalInventoryItems:1});
 if(p==="/dashboard/warehouses")return send(state.warehouses);
 if(p==="/drivers/me")return send(state.drivers[0]);
 if(p==="/customers/me")return send(state.customers[0]);
 if(p==="/products/categories")return send([{CategoryID:1,CategoryName:"Gia dụng"}]);
 if(p==="/permissions")return send({orders:[{PermissionID:1,PermissionName:"orders.read"}]});
 if(p==="/shipments/available")return send([]);
 if(p==="/notifications/read-all"&&m==="PUT"){state.notifications.forEach(n=>n.IsRead=true);await save();return send(null);}
 if(/^\/notifications\/\d+\/read$/.test(p)&&m==="PUT"){state.notifications.forEach(n=>n.IsRead=true);await save();return send(null);}
 if(p==="/settings"&&m==="PUT"){if(!body.key||body.value===undefined)return send("Missing key/value",400);const r=state.settings.find(s=>s.SettingKey===body.key);if(r)r.SettingValue=body.value;await save();return send(null);}
 if(/^\/inventory\/\d+$/.test(p)&&m==="PUT"){const r=state.inventory.find(r=>r.InventoryID===Number(p.split("/")[2]));if(!r)return send("Inventory not found",404);if(typeof body.quantity!=="number"||typeof body.reservedQuantity!=="number")return send("Invalid inventory payload",400);r.Quantity=body.quantity;r.ReservedQuantity=body.reservedQuantity;await save();return send(r);}
 if(/^\/shipments\/\d+\/status$/.test(p)&&m==="PUT"){const r=state.shipments.find(r=>r.ShipmentID===Number(p.split("/")[2]));if(!r)return send("Shipment not found",404);if(!["WAITING","PICKED_UP","IN_TRANSIT","DELIVERED","CANCELLED"].includes(body.status))return send("Invalid status",400);r.ShipmentStatus=body.status;await save();return send(r);}
 if(/^\/orders\/\d+\/status$/.test(p)&&m==="PUT"){state.orders[0].OrderStatus=body.status;await save();return send(state.orders[0]);}
 if(p==="/orders"&&m==="POST"){if(!body.items?.length||!body.pickupAddress||!body.deliveryAddress)return send("Missing order fields",400);const r={OrderID:state.orders.length+1,OrderCode:"ORD-"+(2047+state.orders.length),OrderStatus:"PENDING",PickupAddress:body.pickupAddress,DeliveryAddress:body.deliveryAddress,CreatedAt:new Date().toISOString(),items:body.items,TotalAmount:body.items.reduce((s,i)=>s+i.price*i.quantity,0)};state.orders.push(r);await save();return send(r,201);}
 if(/^\/tracking\/shipment\/\d+$/.test(p))return send([{TrackingID:1,ShipmentID:1,Status:"IN_TRANSIT",Description:"Đang vận chuyển",CreatedAt:"2026-10-28T03:00:00Z"}]);
 if(/^\/ai\/shipment-route\/\d+$/.test(p))return send({pickup:{lat:10.85,lng:106.75,address:"Kho Thủ Đức"},delivery:{lat:10.775,lng:106.704,address:"Nguyễn Huệ"},geometry:[[10.85,106.75],[10.775,106.704]],distanceKm:12.4,durationMinutes:30,eta:{predictedETA:"2026-10-28T07:35:00Z",confidenceScore:94,estimatedMinutes:30},source:"python"});
 if(/^\/reviews\/driver\/\d+\/rating$/.test(p))return send({AvgRating:4.9,ReviewCount:24});
 if(/^\/reviews\/shipment\//.test(p))return send(null);
 if(p==="/reports/orders")return send([{OrderStatus:"SHIPPING",Count:1,Revenue:1250000}]);
 if(p==="/reports/revenue")return send([{Month:"2026-10",TotalOrders:1,Revenue:1250000}]);
 if(p==="/reports/drivers")return send([{DriverName:"Trần Minh",TotalTrips:124,Rating:4.9,CompletedShipments:1,AvgDeliveryMinutes:30}]);
 const match=p.match(/^\/(orders|shipments|products|warehouses|drivers|vehicles|customers|inventory|settings|notifications|roles|users)(?:\/(\d+))?$/);
 if(match&&m==="GET"){let rows=state[match[1]];if(match[2]){const key={orders:"OrderID",shipments:"ShipmentID",roles:"RoleID"}[match[1]];const r=rows.find(r=>r[key]===Number(match[2]));return r?send(r):send("Not found",404);}const search=url.searchParams.get("search")?.toLowerCase();if(search)rows=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search));const status=url.searchParams.get("status");if(status)rows=rows.filter(r=>(r.OrderStatus||r.ShipmentStatus||r.Status)===status);const page=Number(url.searchParams.get("page")||1),limit=Number(url.searchParams.get("limit")||10);return send(rows.slice((page-1)*limit,page*limit),200,{pagination:{page,limit,total:rows.length,totalPages:Math.ceil(rows.length/limit)}});}
 return send("Endpoint outside UI simulation coverage: "+m+" "+p,501);
}).listen(process.env.PORT||4901);
