const swaggerJsDoc = require("swagger-jsdoc");
const swaggerDefinition = require("./swagger");

const options = {
    definition: swaggerDefinition,
    apis: [
        "./src/modules/auth/auth.routes.js",
        "./src/modules/users/users.routes.js",
        "./src/modules/roles/roles.routes.js",
        "./src/modules/permissions/permissions.routes.js",
        "./src/modules/customers/customers.routes.js",
        "./src/modules/orders/orders.routes.js",
        "./src/modules/shipments/shipments.routes.js",
        "./src/modules/drivers/drivers.routes.js",
        "./src/modules/vehicles/vehicles.routes.js",
        "./src/modules/warehouses/warehouses.routes.js",
        "./src/modules/inventory/inventory.routes.js",
        "./src/modules/products/products.routes.js",
        "./src/modules/tracking/tracking.routes.js",
        "./src/modules/notifications/notifications.routes.js",
        "./src/modules/ai/ai.routes.js",
        "./src/modules/dashboard/dashboard.routes.js"
    ]
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
