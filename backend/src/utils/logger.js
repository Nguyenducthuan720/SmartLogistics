const LOG_LEVELS = {
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    DEBUG: "DEBUG"
};

function formatMessage(level, message, meta = null) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

function error(message, meta = null) {
    console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
}

function warn(message, meta = null) {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
}

function info(message, meta = null) {
    console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
}

function debug(message, meta = null) {
    if (process.env.NODE_ENV !== "production") {
        console.debug(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
}

module.exports = { error, warn, info, debug };
