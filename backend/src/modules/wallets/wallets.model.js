const pool = require("../../config/database");
const sql = require("mssql");

async function runTx(callback) {
    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
        const result = await callback(tx);
        await tx.commit();
        return result;
    } catch (err) {
        await tx.rollback();
        throw err;
    }
}

async function ensureWallet(driverId) {
    const existing = await pool.request()
        .input("DriverID", driverId)
        .query("SELECT * FROM DriverWallets WHERE DriverID = @DriverID");
    if (existing.recordset.length > 0) return existing.recordset[0];

    const result = await pool.request()
        .input("DriverID", driverId)
        .query("INSERT INTO DriverWallets (DriverID) OUTPUT INSERTED.* VALUES (@DriverID)");
    return result.recordset[0];
}

async function getByDriver(driverId) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .query("SELECT * FROM DriverWallets WHERE DriverID = @DriverID");
    return result.recordset[0] || null;
}

async function linkBank(driverId, { bankName, bankAccountNumber, accountHolder }) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .input("BankName", bankName || null)
        .input("BankAccountNumber", bankAccountNumber || null)
        .input("AccountHolder", accountHolder || null)
        .query(`
            UPDATE DriverWallets
            SET BankName = @BankName, BankAccountNumber = @BankAccountNumber,
                AccountHolder = @AccountHolder, IsLinked = 1, UpdatedAt = GETDATE()
            OUTPUT INSERTED.*
            WHERE DriverID = @DriverID
        `);
    return result.recordset[0];
}

async function getTransactions(driverId, limit = 30) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .input("Limit", limit)
        .query(`
            SELECT TOP (@Limit) * FROM WalletTransactions
            WHERE DriverID = @DriverID
            ORDER BY CreatedAt DESC
        `);
    return result.recordset;
}

async function getEarnings(driverId) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .query(`
            SELECT e.*, o.OrderCode, o.DeliveryAddress, o.DeliveryProvince
            FROM DriverEarnings e
            LEFT JOIN Shipments s ON e.ShipmentID = s.ShipmentID
            LEFT JOIN Orders o ON s.OrderID = o.OrderID
            WHERE e.DriverID = @DriverID
            ORDER BY e.CreatedAt DESC
        `);
    return result.recordset;
}

async function getSummary(driverId) {
    const result = await pool.request()
        .input("DriverID", driverId)
        .query(`
            SELECT
                ISNULL(SUM(Amount), 0) AS TotalEarned,
                ISNULL(SUM(CASE WHEN Status = 'PENDING' THEN Amount ELSE 0 END), 0) AS Pending,
                ISNULL(SUM(CASE WHEN Status = 'PAID' THEN Amount ELSE 0 END), 0) AS Paid
            FROM DriverEarnings
            WHERE DriverID = @DriverID
        `);

    const txResult = await pool.request()
        .input("DriverID", driverId)
        .query(`
            SELECT ISNULL(SUM(CASE WHEN Type = 'WITHDRAW' OR Type = 'PAYOUT' THEN Amount ELSE 0 END), 0) AS Withdrawn
            FROM WalletTransactions
            WHERE DriverID = @DriverID
        `);

    const summary = result.recordset[0] || { TotalEarned: 0, Pending: 0, Paid: 0 };
    summary.Withdrawn = txResult.recordset[0]?.Withdrawn || 0;
    return summary;
}

async function hasEarning(shipmentId) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query("SELECT COUNT(*) AS cnt FROM DriverEarnings WHERE ShipmentID = @ShipmentID");
    return result.recordset[0].cnt > 0;
}

async function getOrderTotal(shipmentId) {
    const result = await pool.request()
        .input("ShipmentID", shipmentId)
        .query(`
            SELECT ISNULL(o.TotalAmount, 0) AS TotalAmount
            FROM Shipments s
            JOIN Orders o ON s.OrderID = o.OrderID
            WHERE s.ShipmentID = @ShipmentID
        `);
    return result.recordset[0]?.TotalAmount || 0;
}

async function creditEarning(shipmentId, driverId, amount) {
    return runTx(async (tx) => {
        const wallet = await ensureWallet(driverId);

        await tx.request()
            .input("ShipmentID", shipmentId)
            .input("DriverID", driverId)
            .input("Amount", amount)
            .query("INSERT INTO DriverEarnings (ShipmentID, DriverID, Amount, Status) VALUES (@ShipmentID, @DriverID, @Amount, 'PENDING')");

        const balance = (wallet.Balance || 0) + amount;
        await tx.request()
            .input("DriverID", driverId)
            .input("Amount", amount)
            .input("Balance", balance)
            .input("ShipmentID", shipmentId)
            .query(`
                INSERT INTO WalletTransactions (WalletID, DriverID, Type, Amount, BalanceAfter, Description, ReferenceID)
                VALUES ((SELECT WalletID FROM DriverWallets WHERE DriverID = @DriverID), @DriverID, 'EARN', @Amount, @Balance, 'Earning from shipment', @ShipmentID);
                UPDATE DriverWallets SET Balance = @Balance, UpdatedAt = GETDATE() WHERE DriverID = @DriverID;
            `);

        return amount;
    });
}

async function deposit(driverId, amount) {
    return runTx(async (tx) => {
        const wallet = await ensureWallet(driverId);
        const balance = (wallet.Balance || 0) + amount;
        await tx.request()
            .input("DriverID", driverId)
            .input("Amount", amount)
            .input("Balance", balance)
            .query(`
                INSERT INTO WalletTransactions (WalletID, DriverID, Type, Amount, BalanceAfter, Description)
                VALUES ((SELECT WalletID FROM DriverWallets WHERE DriverID = @DriverID), @DriverID, 'DEPOSIT', @Amount, @Balance, 'Wallet top-up');
                UPDATE DriverWallets SET Balance = @Balance, UpdatedAt = GETDATE() WHERE DriverID = @DriverID;
            `);
        return balance;
    });
}

async function withdraw(driverId, amount) {
    return runTx(async (tx) => {
        const wallet = await ensureWallet(driverId);
        const balance = (wallet.Balance || 0) - amount;
        await tx.request()
            .input("DriverID", driverId)
            .input("Amount", amount)
            .input("Balance", balance)
            .query(`
                INSERT INTO WalletTransactions (WalletID, DriverID, Type, Amount, BalanceAfter, Description)
                VALUES ((SELECT WalletID FROM DriverWallets WHERE DriverID = @DriverID), @DriverID, 'WITHDRAW', @Amount, @Balance, 'Withdraw to linked bank');
                UPDATE DriverWallets SET Balance = @Balance, UpdatedAt = GETDATE() WHERE DriverID = @DriverID;
                UPDATE DriverEarnings SET Status = 'PAID', PaidAt = GETDATE() WHERE DriverID = @DriverID AND Status = 'PENDING';
            `);
        return balance;
    });
}

module.exports = {
    ensureWallet, getByDriver, linkBank, getTransactions, getEarnings, getSummary,
    hasEarning, getOrderTotal, creditEarning, deposit, withdraw
};
