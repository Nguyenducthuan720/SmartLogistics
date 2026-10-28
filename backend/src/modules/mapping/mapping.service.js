const { GEOCODING, ROUTING } = require("./mapping.constants");
const logger = require("../../utils/logger");

async function httpGet(url, timeoutMs = GEOCODING.timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": GEOCODING.userAgent,
                "Accept-Language": "vi,en"
            },
            signal: controller.signal
        });
        if (!res.ok) {
            throw new Error(`Geocoding provider responded with status ${res.status}`);
        }
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

function normalizeAddress(raw) {
    if (!raw) return null;

    const addr = raw.address || {};

    return {
        placeId: raw.place_id,
        displayName: raw.display_name,
        address: {
            houseNumber: addr.house_number || null,
            road: addr.road || null,
            suburb: addr.suburb || addr.neighbourhood || null,
            district: addr.district || addr.quarter || addr.city_district || null,
            city: addr.city || addr.town || addr.village || addr.municipality || null,
            state: addr.state || null,
            postcode: addr.postcode || null,
            country: addr.country || null,
            countryCode: addr.country_code || null
        },
        latitude: parseFloat(raw.lat),
        longitude: parseFloat(raw.lon),
        boundingBox: raw.boundingbox ? raw.boundingbox.map(Number) : null,
        type: raw.type || null,
        category: raw.category || null,
        importance: raw.importance || null
    };
}

async function geocode(address, limit = GEOCODING.defaultLimit) {
    const url = `${GEOCODING.nominatimUrl}/search?q=${encodeURIComponent(address)}&format=jsonv2&addressdetails=1&limit=${limit}`;
    const results = await httpGet(url);
    return (Array.isArray(results) ? results : []).map(normalizeAddress);
}

async function reverseGeocode(lat, lng) {
    const url = `${GEOCODING.nominatimUrl}/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`;
    const raw = await httpGet(url);
    return normalizeAddress(raw);
}

async function getRoute(startLat, startLng, endLat, endLng) {
    const coords = `${startLng},${startLat};${endLng},${endLat}`;
    const url = `${ROUTING.osrmUrl}/route/v1/${ROUTING.profile}/${coords}?overview=full&geometries=geojson&steps=true`;
    const data = await httpGet(url, ROUTING.timeoutMs);

    if (!data || data.code !== "Ok" || !Array.isArray(data.routes) || data.routes.length === 0) {
        throw new Error("No road route found between the given points");
    }

    const route = data.routes[0];
    const geometry = (route.geometry && route.geometry.coordinates)
        ? route.geometry.coordinates.map((c) => [c[1], c[0]])
        : [];

    const steps = ((route.legs && route.legs[0] && route.legs[0].steps) || []).map((s) => ({
        maneuver: s.maneuver?.type || null,
        modifier: s.maneuver?.modifier || null,
        name: s.name || "",
        distanceMeters: Math.round(s.distance || 0),
        durationSeconds: Math.round(s.duration || 0)
    }));

    return {
        distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
        durationMinutes: Math.round(route.duration / 60),
        geometry,
        steps
    };
}

module.exports = { geocode, reverseGeocode, getRoute };
