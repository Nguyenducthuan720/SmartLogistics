import api from "./api";

export async function geocodeAddress(address, limit = 6) {
    const { data } = await api.get("/mapping/geocode", { params: { address, limit } });
    return data.data || [];
}

export async function reverseGeocode(lat, lng) {
    const { data } = await api.get("/mapping/reverse", { params: { lat, lng } });
    return data.data;
}

export async function getRoute(pickupLat, pickupLng, deliveryLat, deliveryLng) {
    const { data } = await api.get("/mapping/route", {
        params: { pickupLat, pickupLng, deliveryLat, deliveryLng }
    });
    return data.data;
}
