const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";
const TIMEOUT_MS = 4000;

async function callService(path, payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(`${AI_SERVICE_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        if (!res.ok) throw new Error(`AI service responded with status ${res.status}`);
        const json = await res.json();
        return json && json.success ? json.data : null;
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { callService, AI_SERVICE_URL };