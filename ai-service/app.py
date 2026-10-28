from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from eta_prediction import predict_eta
from route_optimizer import optimize_route

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("AI_PORT", 5001))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ai-service"})


@app.route("/predict-eta", methods=["POST"])
def eta_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No JSON body"}), 400

        required = ["distance_km", "vehicle_type"]
        for field in required:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing field: {field}"}), 400

        result = predict_eta(
            distance_km=float(data["distance_km"]),
            vehicle_type=data["vehicle_type"],
            traffic_level=data.get("traffic_level", "medium"),
            weather=data.get("weather", "clear"),
            historical_minutes=data.get("historical_minutes")
        )

        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/optimize-route", methods=["POST"])
def route_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No JSON body"}), 400

        required = ["delivery_points"]
        if "delivery_points" not in data:
            return jsonify({"success": False, "message": "Missing field: delivery_points"}), 400

        result = optimize_route(
            warehouse=data.get("warehouse", {"lat": 10.8231, "lng": 106.6297}),
            driver_location=data.get("driver_location", {"lat": 10.8231, "lng": 106.6297}),
            delivery_points=data["delivery_points"]
        )

        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == "__main__":
    print(f"AI Service starting on port {PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
