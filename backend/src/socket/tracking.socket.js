const driversModel = require("../modules/drivers/drivers.model");

module.exports = function (io) {
    io.on("connection", (socket) => {
        socket.on("driver:location", async (data) => {
            try {
                const { driverId, latitude, longitude } = data;
                await driversModel.updateLocation(driverId, latitude, longitude);

                const driver = await driversModel.findById(driverId);

                io.emit("driver:location:update", {
                    driverId,
                    latitude,
                    longitude,
                    driverName: driver?.FullName || "Unknown",
                    updatedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error("[Socket] driver:location error:", err.message);
            }
        });

        socket.on("driver:subscribe", (driverId) => {
            socket.join(`driver:${driverId}`);
        });
    });
};
