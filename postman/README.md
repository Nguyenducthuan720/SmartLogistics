# Frontend HTTP simulation

Purpose: exercise existing frontend with the backend response shapes from `backend/src/modules`, without SQL or real credentials. Fixture state is stored in Postman's local simulation state. This is not a replacement backend and must not be deployed.

From repository root, with Postman CLI installed:

```powershell
postman simulation run postman/simulations/frontend/frontend.sim.yaml --port 4900 --no-history --output ndjson
```

In a separate PowerShell terminal:

```powershell
cd frontend
$env:VITE_API_BASE_URL='http://127.0.0.1:4900/backend/api'
npm run dev -- --host 127.0.0.1 --port 5174
```

The smoke test uses an isolated Playwright installation. Install `@playwright/test` in a tools folder, run its `playwright install chromium`, set `UI_TEST_TOOLS` to that folder (the parent of `node_modules`), then from repo root run:

```powershell
node frontend/tests/figma-ui.smoke.cjs
```

Test-only accounts: `admin`, `warehouse`, `driver`, `customer`; password `fixture-password`. The script resets simulation data using the fixture-only `/__reset` endpoint. State writes exercised: inventory adjustment, settings, customer order creation, shipment delivery. Screenshots and JSON assertions are written under `frontend/test-results/figma`.

Fixtures cover collection/detail reads used by route smoke tests, login/profile, notifications, route rendering, ratings and the writes above. Unsupported endpoints return 501. The fixture does not enforce backend authorization; route guard assertions prove frontend behavior only. Production RBAC remains enforced by backend middleware. No WebSocket, SQL, AI provider, payment or real location behavior is simulated. Review Postman request output for HTTP status and path evidence.
