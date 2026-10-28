const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/users.routes");

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart Logistics Backend API"
    });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

const roleRoutes = require("../modules/roles/roles.routes");
const permissionRoutes = require("../modules/permissions/permissions.routes");
const customerRoutes = require("../modules/customers/customers.routes");
const orderRoutes = require("../modules/orders/orders.routes");
const shipmentRoutes = require("../modules/shipments/shipments.routes");
const driverRoutes = require("../modules/drivers/drivers.routes");
const vehicleRoutes = require("../modules/vehicles/vehicles.routes");
const warehouseRoutes = require("../modules/warehouses/warehouses.routes");
const inventoryRoutes = require("../modules/inventory/inventory.routes");
const productRoutes = require("../modules/products/products.routes");
const trackingRoutes = require("../modules/tracking/tracking.routes");
const notificationRoutes = require("../modules/notifications/notifications.routes");
const aiRoutes = require("../modules/ai/ai.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const reportsRoutes = require("../modules/reports/reports.routes");
const settingsRoutes = require("../modules/settings/settings.routes");
const mappingRoutes = require("../modules/mapping/mapping.routes");
const walletsRoutes = require("../modules/wallets/wallets.routes");
const reviewsRoutes = require("../modules/reviews/reviews.routes");

router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/customers", customerRoutes);
router.use("/orders", orderRoutes);
router.use("/shipments", shipmentRoutes);
router.use("/drivers", driverRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/products", productRoutes);
router.use("/tracking", trackingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/ai", aiRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportsRoutes);
router.use("/settings", settingsRoutes);
router.use("/mapping", mappingRoutes);
router.use("/wallets", walletsRoutes);
router.use("/reviews", reviewsRoutes);

module.exports = router;