import api from "./api";

export async function getShipmentRoute(shipmentId) {
    const { data } = await api.get(`/ai/shipment-route/${shipmentId}`);
    return data.data;
}
