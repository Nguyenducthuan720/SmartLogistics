const aiModel = require("./ai.model");
const aiClient = require("./ai.client");
const logger = require("../../utils/logger");
const shipmentsModel = require("../shipments/shipments.model");
const mappingService = require("../mapping/mapping.service");

const TRAFFIC_FACTORS = { light: 1.15, medium: 1.0, heavy: 0.7, severe: 0.4 };
const WEATHER_FACTORS = { clear: 1.0, rain: 0.85, heavy_rain: 0.65, fog: 0.75 };
const VEHICLE_SPEEDS = { truck: 50, van: 60, car: 70, motorbike: 45 };

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseLocation(warehouse) {
    if (!warehouse) return [10.8231, 106.6297];
    const lat = parseFloat(warehouse.Latitude) || 10.8231;
    const lng = parseFloat(warehouse.Longitude) || 106.6297;
    return [lat, lng];
}

function tournament(fitness, k = 4) {
    let best = null;
    for (let i = 0; i < k; i++) { const c = fitness[Math.floor(Math.random() * fitness.length)]; if (!best || c.score < best.score) best = c; }
    return best;
}

function crossover(p1, p2) {
    const pt = Math.floor(Math.random() * p1.length);
    return [...p1.slice(0, pt), ...p2.slice(pt)];
}

function mutate(c) {
    const i = Math.floor(Math.random() * c.length);
    const m = [...c]; m[i] = Math.random(); return m;
}

async function nodeOptimizeRoute(pickupLat, pickupLng, deliveryLat, deliveryLng) {
    const routes = await aiModel.getRoutes();
    const distance = haversine(pickupLat, pickupLng, deliveryLat, deliveryLng);

    const POP_SIZE = 30, GENS = 80;
    let population = Array.from({ length: POP_SIZE }, () => Array.from({ length: routes.length }, () => Math.random()));

    for (let gen = 0; gen < GENS; gen++) {
        const fitness = population.map(c => ({ chromosome: c, score: c.reduce((s, g, i) => s + g * (routes[i].DistanceKM * 0.5 + routes[i].EstimatedHours * 10), 0) + distance * 2 }));
        fitness.sort((a, b) => a.score - b.score);
        const elite = fitness.slice(0, 3).map(f => f.chromosome);
        const newPop = [...elite];
        while (newPop.length < POP_SIZE) {
            const p1 = tournament(fitness), p2 = tournament(fitness);
            let child = crossover(p1.chromosome, p2.chromosome);
            if (Math.random() < 0.12) child = mutate(child);
            newPop.push(child);
        }
        population = newPop;
    }

    const final = population.map(c => ({ chromosome: c, score: c.reduce((s, g, i) => s + g * (routes[i].DistanceKM * 0.5 + routes[i].EstimatedHours * 10), 0) + distance * 2 }));
    final.sort((a, b) => a.score - b.score);

    return {
        optimalRoute: routes[final[0].chromosome.indexOf(Math.max(...final[0].chromosome))],
        estimatedDistance: parseFloat(distance.toFixed(2)),
        estimatedTimeHours: parseFloat((distance / 50).toFixed(1)),
        fitnessScore: parseFloat(final[0].score.toFixed(2)),
        confidenceScore: Math.max(70, Math.min(95, 100 - final[0].score / 5)),
        algorithm: "genetic_algorithm",
        source: "node"
    };
}

async function optimizeRoute(pickupLat, pickupLng, deliveryLat, deliveryLng) {
    try {
        const py = await aiClient.callService("/optimize-route", {
            warehouse: { lat: pickupLat, lng: pickupLng },
            driver_location: { lat: pickupLat, lng: pickupLng },
            delivery_points: [{ lat: deliveryLat, lng: deliveryLng, address: "Delivery" }]
        });

        if (!py || py.total_distance_km == null) throw new Error("Empty python route result");

        return {
            optimalRoute: { RouteCode: "AI-OPT" },
            estimatedDistance: parseFloat(Number(py.total_distance_km).toFixed(2)),
            estimatedTimeHours: py.estimated_time_hours,
            fitnessScore: parseFloat(Number(py.total_distance_km).toFixed(2)),
            confidenceScore: 90,
            algorithm: py.algorithm || "python_genetic_algorithm",
            source: "python"
        };
    } catch (err) {
        logger.warn("AI route service unavailable, falling back to Node", { error: err.message });
        return nodeOptimizeRoute(pickupLat, pickupLng, deliveryLat, deliveryLng);
    }
}

async function nodePredictETA(shipmentId) {
    const history = await aiModel.getShipmentHistory();

    if (history.length > 0) {
        const minutes = history.map(h => h.ActualMinutes || 0);
        const avg = minutes.reduce((s, m) => s + m, 0) / minutes.length;
        const recent = minutes.slice(0, Math.min(10, minutes.length));
        const recentAvg = recent.reduce((s, m) => s + m, 0) / recent.length;
        const weighted = recentAvg * 0.7 + avg * 0.3;
        const variance = minutes.reduce((s, m) => s + (m - avg) ** 2, 0) / minutes.length;
        const confidence = Math.max(50, Math.min(95, 100 - (Math.sqrt(variance) / Math.max(avg, 1)) * 25));

        const eta = new Date(Date.now() + weighted * 60 * 1000);
        await aiModel.savePrediction({ shipmentId, predictedETA: eta, predictedDistance: history[0]?.DistanceKM || 0, confidenceScore: Math.round(confidence), modelVersion: "ETA_V2" });
        return { predictedETA: eta.toISOString(), estimatedMinutes: Math.round(weighted), confidenceScore: Math.round(confidence), basedOnHistory: true, sampleSize: history.length, source: "node", method: "node_history" };
    }

    const eta = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return { predictedETA: eta.toISOString(), estimatedMinutes: 1440, confidenceScore: 50, basedOnHistory: false, source: "node", method: "node_default" };
}

async function predictETA(shipmentId) {
    try {
        const info = await aiModel.getShipmentRouteInfo(shipmentId);
        if (!info || !info.DistanceKM) throw new Error("No route distance for python ETA");

        const py = await aiClient.callService("/predict-eta", {
            distance_km: Number(info.DistanceKM),
            vehicle_type: String(info.VehicleType || "truck").toLowerCase(),
            traffic_level: "medium",
            weather: "clear"
        });

        if (!py || py.predicted_eta == null) throw new Error("Empty python ETA result");

        const predictedETA = new Date(py.predicted_eta).toISOString();
        await aiModel.savePrediction({ shipmentId, predictedETA, predictedDistance: Number(info.DistanceKM), confidenceScore: Math.round(py.confidence_score || 85), modelVersion: "PY_ETA_V1" });

        return {
            predictedETA,
            estimatedMinutes: Math.round(py.estimated_minutes || 0),
            estimatedHours: py.estimated_hours,
            confidenceScore: py.confidence_score || 85,
            effectiveSpeedKmh: py.effective_speed_kmh,
            source: "python",
            method: "python_ml"
        };
    } catch (err) {
        logger.warn("AI ETA service unavailable, falling back to Node", { error: err.message });
        return nodePredictETA(shipmentId);
    }
}

async function nodePredictDeliveryTime(distanceKm, vehicleType = "truck", traffic = "medium", weather = "clear") {
    const speed = VEHICLE_SPEEDS[vehicleType] || 50;
    const tf = TRAFFIC_FACTORS[traffic] || 1.0;
    const wf = WEATHER_FACTORS[weather] || 1.0;
    const effectiveSpeed = speed * tf * wf;
    const hours = distanceKm / effectiveSpeed;
    const minutes = hours * 60;
    return {
        estimatedMinutes: Math.round(minutes),
        estimatedHours: parseFloat(hours.toFixed(1)),
        effectiveSpeedKmh: parseFloat(effectiveSpeed.toFixed(1)),
        confidenceScore: Math.max(60, Math.min(92, 85 + (traffic === "light" ? 5 : traffic === "severe" ? -15 : 0) + (weather === "clear" ? 5 : weather === "fog" ? -5 : -10))),
        source: "node",
        method: "node_heuristic"
    };
}

async function predictDeliveryTime(distanceKm, vehicleType = "truck", traffic = "medium", weather = "clear") {
    try {
        const py = await aiClient.callService("/predict-eta", {
            distance_km: Number(distanceKm),
            vehicle_type: vehicleType.toLowerCase(),
            traffic_level: traffic,
            weather
        });

        if (!py || py.predicted_eta == null) throw new Error("Empty python delivery-time result");

        return {
            estimatedMinutes: Math.round(py.estimated_minutes || 0),
            estimatedHours: py.estimated_hours,
            effectiveSpeedKmh: py.effective_speed_kmh,
            confidenceScore: py.confidence_score || 85,
            source: "python",
            method: "python_ml"
        };
    } catch (err) {
        logger.warn("AI delivery-time service unavailable, falling back to Node", { error: err.message });
        return nodePredictDeliveryTime(distanceKm, vehicleType, traffic, weather);
    }
}

async function getPredictionHistory(shipmentId) {
    return aiModel.getPredictions(shipmentId);
}

async function geocodeFirst(text) {
    if (!text) return null;
    try {
        const results = await mappingService.geocode(text, 1);
        if (results.length) return { lat: results[0].latitude, lng: results[0].longitude };
    } catch {}
    return null;
}

async function shipmentRoute(shipmentId) {
    const shipment = await shipmentsModel.findById(shipmentId);
    if (!shipment) throw Object.assign(new Error("Shipment not found"), { statusCode: 404 });

    const pickupText = `${shipment.PickupAddress || ""}, ${shipment.PickupProvince || ""}`.replace(/^,\s*|,\s*$/g, "");
    const deliveryText = `${shipment.DeliveryAddress || ""}, ${shipment.DeliveryProvince || ""}`.replace(/^,\s*|,\s*$/g, "");

    const [pickup, delivery] = await Promise.all([geocodeFirst(pickupText), geocodeFirst(deliveryText)]);
    if (!pickup || !delivery) {
        throw Object.assign(new Error("Could not resolve shipping addresses"), { statusCode: 400 });
    }

    let optimized = null;
    try {
        optimized = await aiClient.callService("/optimize-route", {
            warehouse: { lat: pickup.lat, lng: pickup.lng },
            driver_location: { lat: pickup.lat, lng: pickup.lng },
            delivery_points: [{ lat: delivery.lat, lng: delivery.lng, address: deliveryText }]
        });
    } catch {}

    let road = null;
    try {
        road = await mappingService.getRoute(pickup.lat, pickup.lng, delivery.lat, delivery.lng);
    } catch {}

    const info = await aiModel.getShipmentRouteInfo(shipmentId);
    const distanceKm = road ? road.distanceKm : (optimized && optimized.total_distance_km) || null;
    const vehicleType = String(info?.VehicleType || "truck").toLowerCase();

    let eta = null;
    if (distanceKm) {
        try {
            const pyEta = await aiClient.callService("/predict-eta", {
                distance_km: Number(distanceKm),
                vehicle_type: vehicleType,
                traffic_level: "medium",
                weather: "clear"
            });
            if (pyEta && pyEta.predicted_eta != null) {
                eta = {
                    predictedETA: new Date(pyEta.predicted_eta).toISOString(),
                    estimatedMinutes: Math.round(pyEta.estimated_minutes || 0),
                    confidenceScore: pyEta.confidence_score || 85
                };
            }
        } catch {}
    }

    return {
        pickup: { lat: pickup.lat, lng: pickup.lng, address: pickupText },
        delivery: { lat: delivery.lat, lng: delivery.lng, address: deliveryText },
        geometry: road ? road.geometry : [],
        distanceKm: distanceKm ? parseFloat(Number(distanceKm).toFixed(2)) : null,
        durationMinutes: road ? road.durationMinutes : null,
        algorithm: optimized?.algorithm || "direct",
        source: optimized ? "python" : "node",
        eta
    };
}

module.exports = { optimizeRoute, predictETA, predictDeliveryTime, getPredictionHistory, haversine, shipmentRoute };