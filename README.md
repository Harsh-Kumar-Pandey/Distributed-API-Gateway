# Distributed API Gateway

A production-like API Gateway built with Node.js that demonstrates core backend engineering concepts  rate limiting, authentication, event streaming, and fault tolerance. Built to simulate how companies like Uber and Netflix protect and manage their microservices at scale.

---

## What Problem This Solves

In real distributed systems, millions of requests hit APIs every second. Without protection:
- APIs crash under load
- Databases get overloaded
- Malicious traffic kills servers
- One failing service takes down everything

This gateway sits in front of all microservices and handles: authentication, rate limiting, request routing, event logging, and circuit breaking — all in one place.

---

## Architecture

```
Client
  ↓
API Gateway (Node.js + Express)  :3000
  ↓
Rate Limiter (Redis - Token Bucket)
  ↓
Auth Middleware (JWT)
  ↓
Service Router
  ↙         ↘
User Service   Order Service
:3001          :3002

Every Request → Kafka Producer → request-logs topic → Analytics Consumer → REST API :4000
                                                                                ↓
                                                                         React Dashboard :5173
```

---

## Tech Stack

| Technology | Why |
|---|---|
| Node.js + Express | Gateway and microservices |
| Redis | Token bucket rate limiting — stores per-user bucket state |
| Apache Kafka | Event streaming — every request is published as an event |
| JWT | Stateless authentication at the gateway level |
| opossum | Circuit breaker — stops hammering failing services |
| Recharts | Dashboard charts |
| Docker | Redis, Kafka, Zookeeper containers |

---

## Project Structure

```
api-gateway-project/
├── gateway/                   ← Main API Gateway (port 3000)
│   └── src/
│       ├── middleware/
│       │   ├── rateLimiter.js     ← Redis token bucket algorithm
│       │   ├── auth.js            ← JWT validation
│       │   └── circuitBreaker.js  ← opossum circuit breaker
│       ├── routes/
│       │   └── proxy.js           ← Request forwarding to services
│       ├── kafka/
│       │   └── producer.js        ← Publishes request events
│       ├── config/
│       │   └── services.js        ← Service URLs
│       └── index.js
│
├── services/
│   ├── users/                 ← User Service (port 3001)
│   └── orders/                ← Order Service (port 3002)
│
├── analytics/                 ← Kafka consumer + stats API (port 4000)
│   └── src/
│       ├── consumer.js            ← Reads from request-logs topic
│       ├── metricsStore.js        ← In-memory stats store
│       └── routes/statsRoutes.js  ← Exposes stats via REST
│
├── dashboard/                 ← React monitoring dashboard (port 5173)
│   └── src/
│       ├── components/
│       │   ├── RequestChart.jsx
│       │   ├── RateLimitStats.jsx
│       │   └── ServiceStatus.jsx
│       └── App.jsx
│
├── scripts/
│   └── generate-token.js      ← CLI tool to mint JWT tokens
│
└── docker-compose.yml         ← Redis + Kafka + Zookeeper
```

---

## Core Features

### 1. Token Bucket Rate Limiting
Each user gets a bucket of 10 tokens. Every request consumes one token. Tokens refill at 2 per second. If the bucket is empty, the request is rejected with `429 Too Many Requests`.

Unlike fixed window algorithms, token bucket handles burst traffic gracefully — a user can burst up to the bucket capacity, then gets smoothly throttled.

```
Bucket capacity : 10 tokens
Refill rate     : 2 tokens/second
Headers exposed : X-RateLimit-Remaining, X-RateLimit-Limit
```

### 2. JWT Authentication
Every request (except public routes) must carry a valid Bearer token. The gateway validates the token and injects `x-user-id` into the request headers so downstream services don't need their own auth logic.

### 3. Request Routing
The gateway acts as the single entry point:
```
GET  /users/*   → User Service   :3001
GET  /orders/*  → Order Service  :3002
```

### 4. Kafka Event Pipeline
Every request produces an event to the `request-logs` Kafka topic:
```json
{
  "userId": "harsh123",
  "endpoint": "/users",
  "method": "GET",
  "statusCode": 200,
  "latencyMs": 12,
  "timestamp": "2026-04-01T20:00:00.000Z"
}
```
The analytics consumer processes these events and exposes aggregated stats via REST API.

### 5. Circuit Breaker
Using opossum, each service has a circuit breaker that monitors failures:
- **CLOSED** — normal traffic flowing
- **OPEN** — service failing, requests blocked immediately, fallback returned
- **HALF-OPEN** — testing if service recovered after 10 seconds

```
Timeout                  : 3 seconds
Error threshold          : 50% of requests failing
Reset timeout            : 10 seconds
```

### 6. Monitoring Dashboard
React dashboard auto-refreshes every 5 seconds showing:
- Total requests and errors
- Success rate
- Requests per endpoint (bar chart)
- Average latency per endpoint
- Recent requests table with status codes

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop

### 1. Clone and install dependencies

```bash
git clone https://github.com/Harsh-Kumar-Pandey/Distributed-API-Gateway


# Install dependencies for each service
cd gateway && npm install
cd ../services/users && npm install
cd ../services/orders && npm install
cd ../analytics && npm install
cd ../dashboard && npm install
```

### 2. Set up environment variables

Create `.env` in the `gateway/` folder:
```env
PORT=3000
JWT_SECRET=your_secret_key_here
USERS_SERVICE=http://localhost:3001
ORDERS_SERVICE=http://localhost:3002
```

### 3. Start infrastructure (Redis + Kafka + Zookeeper)

From the project root:
```bash
docker-compose up -d
```

Verify all containers are running:
```bash
docker ps
```
You should see `redis`, `zookeeper`, and `kafka`.

### 4. Start all services

Open separate terminals for each:

```bash
# Terminal 1 - Users Service
cd services/users && node src/index.js

# Terminal 2 - Orders Service
cd services/orders && node src/index.js

# Terminal 3 - API Gateway
cd gateway && node src/index.js

# Terminal 4 - Analytics Service
cd analytics && node src/index.js

# Terminal 5 - Dashboard
cd dashboard && npm run dev
```

### 5. Generate a JWT token

```bash
node gateway/src/scripts/generate-token.js
```

Copy the printed token — you'll need it for all requests.

---

## API Reference

### Gateway Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/gateway/status` | Circuit breaker status for all services |
| ANY | `/users/*` | Proxied to User Service |
| ANY | `/orders/*` | Proxied to Order Service |

### User Service

| Method | Path | Description |
|---|---|---|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create a user |

### Order Service

| Method | Path | Description |
|---|---|---|
| GET | `/orders` | Get all orders |
| GET | `/orders/:id` | Get order by ID |
| POST | `/orders` | Create an order |

### Analytics Service

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/stats` | Aggregated request metrics |
| GET | `/analytics/health` | Health check |

---

## Testing

### Basic request
```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer <your_token>"
```

### Test rate limiting (PowerShell)
```powershell
$token = "<your_token>"
for ($i=1; $i -le 20; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000/users" `
               -Headers @{ Authorization = "Bearer $token" }
        Write-Host "Request $i : $($res.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "Request $i : $code"
    }
}
```

Expected output — first 10 return `200`, rest return `429`.

### Test circuit breaker
1. Stop the users service
2. Hit `/users` several times — watch gateway logs for `🔴 Circuit OPEN`
3. Wait 10 seconds — watch for `🟡 Circuit HALF-OPEN`
4. Restart users service and hit again — watch for `🟢 Circuit CLOSED`

### Check circuit breaker status
```bash
curl http://localhost:3000/gateway/status
```

### Watch Kafka events live
```bash
docker exec -it kafka kafka-console-consumer \
  --topic request-logs \
  --bootstrap-server localhost:9092 \
  --from-beginning
```

---

## Monitoring Dashboard

Open `http://localhost:5173` after starting all services. The dashboard auto-refreshes every 5 seconds and shows real-time request metrics, latency, and recent activity.

---

## Key Design Decisions

**Token bucket over fixed window** — Token bucket allows burst traffic up to capacity then throttles smoothly. Fixed window causes thundering herd at window boundaries.

**Rate limiter before auth** — Reject abusive traffic before doing expensive JWT cryptographic verification.

**Kafka over direct DB writes** — Decouples request logging from the gateway's critical path. If the analytics service goes down, the gateway is unaffected.

**Per-service circuit breakers** — Each downstream service has its own breaker so one failing service doesn't affect others.

**`validateStatus: () => true` in axios** — Prevents axios from throwing on 4xx responses, so opossum only counts network failures as circuit breaker failures — not legitimate error responses from services.

---

## What I Learned

- How API Gateways work as a single entry point in microservice architecture
- Token bucket algorithm implementation using Redis hashes
- Kafka producer/consumer setup for event-driven logging
- Circuit breaker pattern with three states (closed, open, half-open)
- Middleware ordering in Express and why it matters
- Docker Compose for managing multi-container infrastructure

---

## Future Improvements

- [ ] WebSocket proxying for real-time applications
- [ ] Distributed tracing with correlation IDs
- [ ] Load balancing across multiple service instances
- [ ] Prometheus metrics + Grafana dashboard
- [ ] Service discovery instead of hardcoded URLs
- [ ] Redis caching layer for GET responses
- [ ] Docker containerization for all services
