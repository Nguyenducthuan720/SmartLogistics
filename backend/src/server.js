require("dotenv").config();

const http = require("http");

const app = require("./app");
const pool = require("./config/database");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = initSocket(server);

require("./socket/tracking.socket")(io);

async function startServer() {
    try {
        await pool.connect();
        console.log("SQL Server Connected");

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Database Error");
        console.error(err);
    }
}

startServer();
