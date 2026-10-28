const GEOCODING = {
    provider: process.env.GEOCODING_PROVIDER || "nominatim",
    nominatimUrl: process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org",
    userAgent: process.env.GEOCODING_USER_AGENT || "SmartLogistics/1.0 (graduation-project)",
    defaultLimit: 6,
    timeoutMs: 10000
};

const ROUTING = {
    provider: process.env.ROUTING_PROVIDER || "osrm",
    osrmUrl: process.env.OSRM_URL || "https://router.project-osrm.org",
    profile: "driving",
    timeoutMs: 15000
};

module.exports = { GEOCODING, ROUTING };
