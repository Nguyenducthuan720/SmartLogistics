import api from "./api";

export async function createReview(payload) {
    const { data } = await api.post("/reviews", payload);
    return data.data;
}

export async function getShipmentReview(shipmentId) {
    const { data } = await api.get(`/reviews/shipment/${shipmentId}`);
    return data.data;
}

export async function getDriverReviews(driverId) {
    const { data } = await api.get(`/reviews/driver/${driverId}`);
    return data.data || [];
}

export async function getDriverRating(driverId) {
    const { data } = await api.get(`/reviews/driver/${driverId}/rating`);
    return data.data;
}

export async function getMyReviews() {
    const { data } = await api.get("/reviews/me");
    return data.data || [];
}
