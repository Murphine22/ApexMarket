# ApexMarket — Supermarket Management System

A production-ready, full-stack supermarket management system: secure Node/Express + MongoDB API and a visually striking React frontend engineered around how retail teams actually think under pressure.

The frontend runs **standalone in "demo mode"** — open `http://localhost:3000` and the entire app is interactive with seeded data, no backend or database required. Flip a single env flag to switch to the real API.

---

## Highlights

- **Decoupled architecture** — `client/` (React + Vite) and `server/` (Express + MongoDB) are independent and independently deployable.
- **Demo mode** — a fully in-browser data layer (localStorage) lets the UI run with zero backend setup. Toggle `VITE_USE_API=true` to use the real API.
- **Security-first backend** — JWT auth, bcrypt password hashing (12 rounds), role-based access control (admin/staff), `helmet`, rate limiting, `express-mongo-sanitize`, and centralized error handling with Winston logging.
- **Psychologically engineered UI** — glassmorphism, Framer Motion pattern interruptions, pulsating low-stock alerts, liquid-morphing modals, dopamine-driven checkout celebration (confetti + chime + haptics), and a focus mode for cognitive narrowing.
- **Tested** — Jest + Supertest integration tests run against an in-memory MongoDB.
- **Documented** — interactive Swagger UI at `/api/docs`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Zustand, React Query, Recharts |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (access + refresh), bcryptjs |
| Testing | Jest, Supertest, mongodb-memory-server |
| Docs | Swagger (OpenAPI 3.0) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- (Optional) MongoDB — only needed if you run the backend / live API mode

### 1. Frontend only (demo mode — fastest)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000**. Log in with a demo account:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@apexmarket.io` | `admin123` |
| Staff | `staff@apexmarket.io` | `staff123` |

> Admins can manage products, view reports and record stock movements. Staff can browse and run the POS.

### 2. Full stack (real API + MongoDB)

```bash
# Terminal 1 — backend
cd server
npm install
cp .env.example .env        # set MONGO_URI + JWT secrets
npm run seed                # seed users + 100+ products
npm run dev                 # http://localhost:5000

# Terminal 2 — frontend
cd client
npm install
cp .env.example .env        # set VITE_USE_API=true
npm run dev                 # http://localhost:3000
```

API docs: **http://localhost:5000/api/docs**

### Run both together

From the repo root:

```bash
npm install            # installs concurrently
npm run install:all    # installs client + server deps
npm run dev            # runs client + server concurrently
```

---

## Environment Variables

### `client/.env`
| Var | Default | Description |
| --- | --- | --- |
| `VITE_USE_API` | `false` | `false` = demo mode, `true` = call the real backend |
| `VITE_API_URL` | `/api` | API base URL (use `/api` with the dev proxy) |
| `VITE_API_TARGET` | `http://localhost:5000` | Where the Vite dev proxy forwards `/api` |

### `server/.env`
| Var | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `CLIENT_URL` | `http://localhost:3000` | Allowed CORS origin |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/apexmarket` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | — | JWT signing secrets (set strong values!) |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | `15m` / `7d` | Token lifetimes |
| `BCRYPT_SALT_ROUNDS` | `12` | Password hash cost |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | `900000` / `300` | Rate limiting |

---

## Project Structure

```
ApexMarket/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Layout, Sidebar, Topbar, Modal, Motion, …
│   │   ├── pages/             # Login, Dashboard, Products, POS, Inventory, Reports, Settings
│   │   ├── store/            # Zustand stores (auth, cart, ui)
│   │   ├── hooks/             # React Query data hooks
│   │   └── lib/               # api, dataService, demoDb, catalog, utils
│   └── vite.config.js         # dev server on :3000 + /api proxy
│
└── server/                     # Express + MongoDB backend
    ├── src/
    │   ├── config/            # env, db, swagger
    │   ├── controllers/       # request/response handlers
    │   ├── services/          # business logic
    │   ├── models/            # Mongoose schemas (User, Product, Transaction, InventoryLog)
    │   ├── routes/            # Express routers (+ Swagger annotations)
    │   ├── middlewares/       # auth, rbac, validate, error
    │   ├── validators/        # express-validator chains
    │   └── utils/             # logger, token, seed, catalog, ApiError
    └── tests/                  # Jest + Supertest integration tests
```

---

## API Overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | Register (defaults to staff) |
| POST | `/auth/login` | public | Log in, returns access token |
| GET | `/auth/me` | auth | Current user |
| POST | `/auth/logout` | public | Clear refresh cookie |
| GET | `/products` | auth | List/search products |
| POST | `/products` | admin | Create product |
| PUT | `/products/:id` | admin | Update product |
| DELETE | `/products/:id` | admin | Delete product |
| GET | `/transactions` | auth | List transactions |
| POST | `/transactions` | auth | Create sale (validates + decrements stock) |
| GET | `/inventory/logs` | auth | Inventory audit trail |
| GET | `/inventory/low-stock` | auth | Products at/below threshold |
| POST | `/inventory/movements` | admin | Record manual stock movement |

Full interactive docs: **`/api/docs`**.

---

## Testing

```bash
cd server
npm test
```

Integration tests cover authentication, RBAC enforcement, product CRUD, and POS transaction stock validation, running against an in-memory MongoDB (no external database needed).

---

## Deployment

- **Frontend** → Vercel / Netlify (`npm run build` outputs `client/dist`). Set `VITE_USE_API=true` and `VITE_API_URL` to your API URL.
- **Backend** → any Node host (Render, Railway, Fly, Docker). Set the `server/.env` variables and point `MONGO_URI` at MongoDB Atlas.

---

## License

MIT
